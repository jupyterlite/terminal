import { Shell } from '@jupyterlite/cockle';
import { DriveFS } from '@jupyterlite/contents';

import { expose } from 'comlink';

import { WorkerBufferedStdin } from './buffered_stdin';
import { IRemote, IWorkerTerminal } from './tokens';

class WorkerTerminal implements IWorkerTerminal {
  async initialize(options: IWorkerTerminal.IOptions): Promise<void> {
    this._options = options;
    this._bufferedStdin = new WorkerBufferedStdin(
      this._options!.sharedArrayBuffer
    );
    console.log('WorkerTerminal.initialize', this._options, this._wantDriveFS);
  }

  async input(text: string): Promise<void> {
    await this._shell!.input(text);
  }

  registerCallbacks(
    outputCallback: IRemote.OutputCallback,
    enableBufferedStdinCallback: IRemote.EnableBufferedStdinCallback
  ): void {
    this._outputCallback = outputCallback;
    this._enableBufferedStdinCallback = enableBufferedStdinCallback;
  }

  async setSize(rows: number, columns: number): Promise<void> {
    await this._shell!.setSize(rows, columns);
  }

  async start(): Promise<void> {
    this._shell = new Shell({
      mountpoint: this._mountpoint,
      outputCallback: this._output.bind(this),
      enableBufferedStdinCallback: this._enableBufferedStdin.bind(this),
      stdinCallback: this._getStdin.bind(this)
    });

    const { FS, PATH, ERRNO_CODES } = await this._shell.initFilesystem();

    if (this._wantDriveFS) {
      this._driveFS = new DriveFS({
        FS,
        PATH,
        ERRNO_CODES,
        baseUrl: this._options!.baseUrl,
        driveName: '',
        mountpoint: this._mountpoint
      });
      FS.mount(this._driveFS, {}, this._mountpoint);
      FS.chdir(this._mountpoint);
    } else {
      // Add some dummy files if not using DriveFS.
      FS.writeFile('file.txt', 'This is the contents of the file', {
        mode: 0o664
      });
      FS.writeFile('other.txt', 'Some other file', { mode: 0o664 });
      FS.mkdir('dir', 0o775);
    }

    await this._shell.start();
  }

  private async _enableBufferedStdin(enable: boolean): Promise<void> {
    if (enable) {
      await this._bufferedStdin!.enable();
    } else {
      await this._bufferedStdin!.disable();
    }
    if (this._enableBufferedStdinCallback) {
      await this._enableBufferedStdinCallback(enable);
    }
  }

  private _getStdin(): number[] {
    return this._bufferedStdin!.get();
  }

  private async _output(text: string): Promise<void> {
    if (this._outputCallback) {
      await this._outputCallback(text);
    }
  }

  private _options: IWorkerTerminal.IOptions | null = null;
  private _shell?: Shell;
  private _mountpoint: string = '/drive';
  private _wantDriveFS: boolean = true;
  private _driveFS?: DriveFS;

  private _outputCallback?: IRemote.OutputCallback;
  private _enableBufferedStdinCallback?: IRemote.EnableBufferedStdinCallback;
  private _bufferedStdin?: WorkerBufferedStdin;
}

const obj = new WorkerTerminal();

expose(obj);
