import { BaseManager, Terminal, TerminalManager } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';
import { LiteTerminalConnection } from './terminal';

/**
 * Interface for Lite terminal manager, supports setting browserContextId.
 */
interface ILiteTerminalManager extends Terminal.IManager {
  browsingContextId: string;
}

/**
 * Type guard for ILiteTerminalManager.
 */
export function isILiteTerminalManager(
  obj: Terminal.IManager
): obj is ILiteTerminalManager {
  return 'browsingContextId' in obj;
}

/**
 * A terminal session manager.
 */
export class LiteTerminalManager
  extends BaseManager
  implements ILiteTerminalManager
{
  /**
   * Construct a new terminal manager.
   */
  constructor(options: TerminalManager.IOptions = {}) {
    super(options);

    // Initialize internal data.
    this._ready = (async () => {
      this._isReady = true;
    })();
  }

  /**
   * Set identifier for communicating with service worker.
   */
  set browsingContextId(browsingContextId: string) {
    console.log('==> LiteTerminalManager browsingContextId', browsingContextId);
    this._browsingContextId = browsingContextId;
  }

  /**
   * A signal emitted when there is a connection failure.
   */
  get connectionFailure(): ISignal<this, Error> {
    return this._connectionFailure;
  }

  /*
   * Connect to a running terminal.
   *
   * @param options - The options used to connect to the terminal.
   *
   * @returns The new terminal connection instance.
   *
   * #### Notes
   * The manager `serverSettings` will be used.
   */
  connectTo(
    options: Omit<Terminal.ITerminalConnection.IOptions, 'serverSettings'>
  ): Terminal.ITerminalConnection {
    const { model } = options;
    const { name } = model;
    console.log('==> LiteTerminalManager.connectTo', name);
    const { serverSettings } = this;

    const terminal = new LiteTerminalConnection({
      browsingContextId: this._browsingContextId,
      model,
      serverSettings
    });
    terminal.disposed.connect(() => this.shutdown(name));
    return terminal;
  }

  /**
   * Whether the terminal service is available.
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Test whether the manager is ready.
   */
  get isReady(): boolean {
    return this._isReady;
  }

  /**
   * A promise that fulfills when the manager is ready.
   */
  get ready(): Promise<void> {
    return this._ready;
  }

  /**
   * Force a refresh of the running terminals.
   *
   * @returns A promise that with the list of running terminals.
   *
   * #### Notes
   * This is intended to be called only in response to a user action,
   * since the manager maintains its internal state.
   */
  async refreshRunning(): Promise<void> {
    this._runningChanged.emit(this._models);
  }

  /**
   * Create an iterator over the most recent running terminals.
   *
   * @returns A new iterator over the running terminals.
   */
  running(): IterableIterator<Terminal.IModel> {
    return this._models[Symbol.iterator]();
  }

  /**
   * A signal emitted when the running terminals change.
   */
  get runningChanged(): ISignal<this, Terminal.IModel[]> {
    return this._runningChanged;
  }

  /**
   * Shut down a terminal session by name.
   */
  async shutdown(name: string): Promise<void> {
    const terminal = this._terminalConnections.get(name);
    if (terminal !== undefined) {
      this._terminalConnections.delete(name);
      terminal.dispose();
      this.refreshRunning();
    }
  }

  /**
   * Shut down all terminal sessions.
   *
   * @returns A promise that resolves when all of the sessions are shut down.
   */
  async shutdownAll(): Promise<void> {
    await Promise.all(this._models.map(model => this.shutdown(model.name)));
    this.refreshRunning();
  }

  /**
   * Create a new terminal session.
   *
   * @param options - The options used to create the terminal.
   *
   * @returns A promise that resolves with the terminal connection instance.
   *
   * #### Notes
   * The manager `serverSettings` will be used unless overridden in the
   * options.
   */
  async startNew(
    options: Terminal.ITerminal.IOptions
  ): Promise<Terminal.ITerminalConnection> {
    const name = options.name ?? this._nextAvailableName();
    const model: Terminal.IModel = { name };
    const { serverSettings } = this;

    const terminal = new LiteTerminalConnection({
      browsingContextId: this._browsingContextId,
      model,
      serverSettings
    });
    terminal.disposed.connect(() => this.shutdown(name));
    this._terminalConnections.set(name, terminal);
    await this.refreshRunning();
    return terminal;
  }

  private get _models(): Terminal.IModel[] {
    return Array.from(this._terminalConnections, ([name, value]) => {
      return { name };
    });
  }

  private _nextAvailableName(): string {
    for (let i = 1; ; ++i) {
      const name = `${i}`;
      if (!this._terminalConnections.has(name)) {
        return name;
      }
    }
  }

  private _browsingContextId?: string;
  private _connectionFailure = new Signal<this, Error>(this);
  private _isReady = false;
  private _ready: Promise<void>;
  private _runningChanged = new Signal<this, Terminal.IModel[]>(this);
  private _terminalConnections = new Map<
    string,
    Terminal.ITerminalConnection
  >();
}
