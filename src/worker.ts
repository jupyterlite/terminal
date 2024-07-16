import { Shell } from '@jupyterlite/cockle';
import { DriveFS } from '@jupyterlite/contents';

import { expose } from 'comlink';

import { IRemote, IWorkerTerminal } from './tokens';

class WorkerTerminal implements IWorkerTerminal {
  async initialize(options: IWorkerTerminal.IOptions): Promise<void> {
    this._options = options;
    console.log('WorkerTerminal.initialize', this._options, this._wantDriveFS);
  }

  async input(text: string): Promise<void> {
    await this._shell!.input(text);
  }

  registerCallbacks(outputCallback: IRemote.OutputCallback) {
    this._outputCallback = outputCallback;
  }

  async setSize(rows: number, columns: number): Promise<void> {
    await this._shell!.setSize(rows, columns);
  }

  async start(): Promise<void> {
    this._shell = new Shell(this.output.bind(this), this._mountpoint);
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
      FS.writeFile('file.txt', 'This is the contents of the file');
      FS.writeFile('other.txt', 'Some other file');
      FS.mkdir('dir');
    }

    await this._shell.start();
  }

  private async output(text: string): Promise<void> {
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
}

const obj = new WorkerTerminal();

expose(obj);
