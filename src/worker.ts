import { Shell } from '@jupyterlite/cockle';
import { DriveFS } from '@jupyterlite/contents';

import { expose } from 'comlink';

import { IWorkerTerminal } from './tokens';

class WorkerTerminal implements IWorkerTerminal {
  async initialize(options: IWorkerTerminal.IOptions): Promise<void> {
    this._options = options;
    console.log('WorkerTerminal.initialize', this._options, this._wantDriveFS);
  }

  async input(text: string): Promise<void> {
    await this._shell!.input(text);
  }

  async setSize(rows: number, columns: number): Promise<void> {
    await this._shell!.setSize(rows, columns);
  }

  async start(): Promise<void> {
    this._shell = new Shell(this.output, this._mountpoint);
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
    postMessage({
      type: 'output',
      text: text
    });
  }

  private _options: IWorkerTerminal.IOptions | null = null;
  private _shell?: Shell;
  private _mountpoint: string = '/drive';
  private _wantDriveFS: boolean = true;
  private _driveFS?: DriveFS;
}

const obj = new WorkerTerminal();

expose(obj);
