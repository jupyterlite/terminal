/**
 * Classes to deal with buffered stdin. Both main and webworkers have access to the same
 * SharedArrayBuffer and use that to pass stdin characters from the UI (main worker) to the shell
 * (webworker). This is necessary when the shell is running a WASM command that is synchronous and
 * blocking, as the usual async message passing from main to webworker does not work as the received
 * messages would only be processed when the command has finished.
 */

// Indexes into SharedArrayBuffer.
const MAIN = 0;
const WORKER = 1;
const LENGTH = 2;
const START_CHAR = 3;

abstract class BufferedStdin {
  constructor(sharedArrayBuffer?: SharedArrayBuffer) {
    if (sharedArrayBuffer === undefined) {
      const length = (this._maxChars + 3) * Int32Array.BYTES_PER_ELEMENT;
      this._sharedArrayBuffer = new SharedArrayBuffer(length);
    } else {
      this._sharedArrayBuffer = sharedArrayBuffer;
    }

    this._intArray = new Int32Array(this._sharedArrayBuffer);
    if (sharedArrayBuffer === undefined) {
      this._intArray[MAIN] = 0;
      this._intArray[WORKER] = 0;
    }
  }

  async disable(): Promise<void> {
    this._enabled = false;
    this._clear();
  }

  async enable(): Promise<void> {
    this._enabled = true;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  protected _clear() {
    this._intArray[MAIN] = 0;
    this._intArray[WORKER] = 0;
    this._readCount = 0;
  }

  /**
   * Load the character from the shared array buffer and return it.
   */
  protected _loadFromSharedArrayBuffer(): number[] {
    const len = Atomics.load(this._intArray, LENGTH);
    const ret: number[] = [];
    for (let i = 0; i < len; i++) {
      ret.push(Atomics.load(this._intArray, START_CHAR + i));
    }
    return ret;
  }

  protected _enabled: boolean = false;
  protected _maxChars: number = 8; // Max number of actual characters in a token.
  protected _sharedArrayBuffer: SharedArrayBuffer;
  protected _intArray: Int32Array;
  protected _readCount: number = 0;
}

export namespace MainBufferedStdin {
  export interface ISendStdinNow {
    (output: string): Promise<void>;
  }
}

/**
 * Main worker buffers characters locally, and stores just one character at a time in the
 * SharedArrayBuffer so that the web worker can read it.
 */
export class MainBufferedStdin extends BufferedStdin {
  constructor() {
    super();
  }

  override async disable(): Promise<void> {
    // Send all remaining buffered characters as soon as possible via the supplied sendFunction.
    this._disabling = true;
    if (this._storedCount !== this._readCount) {
      const codes = this._loadFromSharedArrayBuffer();
      let text = '';
      for (const code of codes) {
        text += String.fromCharCode(code);
      }
      await this._sendStdinNow!(text);
    }
    while (this._buffer.length > 0) {
      await this._sendStdinNow!(this._buffer.shift()!);
    }
    this._disabling = false;

    super.disable();
  }

  get sharedArrayBuffer(): SharedArrayBuffer {
    return this._sharedArrayBuffer;
  }

  /**
   * Push a character to the buffer.
   * It may or may not be stored in the SharedArrayBuffer immediately.
   */
  async push(char: string) {
    // May be multiple characters if ANSI control sequence.
    this._buffer.push(char);
    this._bufferCount++;

    if (char.length > this._maxChars) {
      // Too big, log this and do not pass it on?
      console.log(`String '${char}' is too long to buffer`);
    }

    if (!this._disabling && this._readCount === this._storedCount) {
      this._storeInSharedArrayBuffer();
    }
  }

  registerSendStdinNow(sendStdinNow: MainBufferedStdin.ISendStdinNow) {
    this._sendStdinNow = sendStdinNow;
  }

  /**
   * After a successful read by the worker, main checks if another character can be stored in the
   * SharedArrayBuffer.
   */
  private _afterRead() {
    this._readCount = Atomics.load(this._intArray, 1);
    if (this._readCount !== this._storedCount) {
      throw new Error('Should not happen');
    }

    if (this._bufferCount > this._storedCount) {
      this._storeInSharedArrayBuffer();
    }
  }

  protected override _clear() {
    super._clear();
    this._buffer = [];
    this._bufferCount = 0;
    this._storedCount = 0;
  }

  private _storeInSharedArrayBuffer() {
    const char: string = this._buffer.shift()!;
    this._storedCount++;

    // Store character in SharedArrayBuffer.
    const len = char.length;
    Atomics.store(this._intArray, LENGTH, len);
    for (let i = 0; i < len; i++) {
      Atomics.store(this._intArray, START_CHAR + i, char.charCodeAt(i));
    }

    // Notify web worker that a new character is available.
    Atomics.store(this._intArray, MAIN, this._storedCount);
    Atomics.notify(this._intArray, MAIN, 1);

    // Async wait for web worker to read this character.
    const { async, value } = Atomics.waitAsync(
      this._intArray,
      WORKER,
      this._readCount
    );
    if (async) {
      value.then(() => this._afterRead());
    }
  }

  private _buffer: string[] = [];
  private _bufferCount: number = 0;
  private _disabling: boolean = false;
  private _storedCount: number = 0;
  private _sendStdinNow?: MainBufferedStdin.ISendStdinNow;
}

export class WorkerBufferedStdin extends BufferedStdin {
  constructor(sharedArrayBuffer: SharedArrayBuffer) {
    super(sharedArrayBuffer);
  }

  get(): number[] {
    // Wait for main worker to store a new character.
    Atomics.wait(this._intArray, MAIN, this._readCount);
    const ret = this._loadFromSharedArrayBuffer();
    this._readCount++;

    // Notify main worker that character has been read and a new one can be stored.
    Atomics.store(this._intArray, WORKER, this._readCount);
    Atomics.notify(this._intArray, WORKER, 1);

    return ret;
  }
}
