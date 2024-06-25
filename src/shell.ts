import { DriveFS } from '@jupyterlite/contents';

import * as CoreutilsModule from './coreutils';
import * as FsModule from './fs';

export interface IOutputCallback {
  (output: string): Promise<void>;
}

export class Shell {
  constructor(outputCallback: IOutputCallback, baseUrl: string) {
    this._baseUrl = baseUrl;
    this._currentLine = '';
    this._outputCallback = outputCallback;
    this._prompt = '\x1b[1;31mjs-shell:$\x1b[1;0m ';
  }

  async input(char: string): Promise<void> {
    // Might be a multi-char string if begins with escape code.
    const code = char.charCodeAt(0);
    if (code === 13) {
      // \r
      await this.output('\r\n');
      const cmdText = this._currentLine.trimStart();
      this._currentLine = '';
      await this._runCommands(cmdText);
      await this.output(this._prompt);
    } else if (code === 127) {
      // Backspace
      if (this._currentLine.length > 0) {
        this._currentLine = this._currentLine.slice(0, -1);
        const backspace = '\x1B[1D';
        await this.output(backspace + ' ' + backspace);
      }
    } else if (code === 9) {
      // Tab \t
      // No tab completion
    } else if (code === 27) {
      // Escape following by 1+ more characters
      const remainder = char.slice(1);
      if (remainder === '[A' || remainder === '[1A') {
        // Up arrow
      } else if (remainder === '[B' || remainder === '[1B') {
        // Down arrow
      }
    } else {
      this._currentLine += char;
      await this.output(char);
    }
  }

  async output(text: string): Promise<void> {
    if (!text) {
      return;
    }
    const lines = text.split('\n');
    const joined = lines.join('\r\n');
    await this._outputCallback(joined);
  }

  async setSize(rows: number, columns: number): Promise<void> {}

  async start(): Promise<void> {
    // Prepare FS from fs module and mount file contents base directory into it.
    this._fsModule = await FsModule.default();
    this._fs = this._fsModule.FS;

    const { FS, PATH, ERRNO_CODES } = this._fsModule;
    this._driveFS = new DriveFS({
      FS,
      PATH,
      ERRNO_CODES,
      baseUrl: this._baseUrl,
      driveName: '',
      mountpoint: this._mountpoint
    });
    FS.mkdir(this._mountpoint, 0o777);
    FS.mount(this._driveFS, {}, this._mountpoint);
    FS.chdir(this._mountpoint);

    await this.output(this._prompt);
  }

  private async _runCommands(cmdText: string): Promise<void> {
    console.log('==> runCommands', cmdText);

    const args = cmdText.trim().split(' ');
    const cmdName = args.shift();
    if (!cmdName) {
      return;
    }

    // Some bash built-in commands use FS directly.
    if (cmdName === 'cd') {
      if (args.length < 1) {
        // Do nothing.
        return;
      }
      const path = args[0];
      // Need to handle path of "_". Maybe previous path is in an env var?
      this._fs.chdir(path);
      // Need to set PWD env var?
      return;
    }

    this._stdin = '';
    this._stdout = '';
    this._stderr = '';

    // Cannot auto-run command as need to attach FS first.
    const start = Date.now();
    const module = await CoreutilsModule.default({
      thisProgram: cmdName,
      //arguments: args,
      print: (text: string) => {
        // If do not have this function, output goes to console.
        //console.log(">>> LOG text to stdout", text)
        this._stdout += `${text}\n`;
      },
      printErr: (text: string) => {
        //console.log(">>> LOG text to stderr", text)
        this._stderr += `${text}\n`;
      },
      quit: (status: any, toThrow: any) => {
        //console.log(">>> MY QUIT", status, toThrow);
      },
      /*stdin: () => {
        this._stdin = "";
        return null;
      },
      stdout: this._stdout,
      stderr: this._stderr,*/
      noInitialRun: true,
      printWithColors: true
    });
    console.log('Loaded module', module, this._stdin);
    console.log('Load time:', Date.now() - start, 'ms');

    // Need to use PROXYFS so that command sees the shared FS.
    const FS = module.FS;
    const mountpoint = this._mountpoint;
    FS.mkdir(mountpoint, 0o777);
    console.log('module FS', FS);
    FS.mount(module.PROXYFS, { root: mountpoint, fs: this._fs }, mountpoint);
    FS.chdir(this._fs.cwd());

    module.callMain(args);

    try {
      console.log('... closing streams');
      FS.close(FS.streams[1]);
      FS.close(FS.streams[2]);
    } catch (error: any) {
      // Re-open stdout/stderr (fix error "error closing standard output: -1")
      console.log('... reopening streams');
      FS.streams[1] = FS.open('/dev/stdout', 'w', 0o777);
      FS.streams[2] = FS.open('/dev/stderr', 'w', 0o777);
    }

    if (this._stdout) {
      //console.log("STDOUT:", this._stdout);
      this.output(this._stdout);
    }
    if (this._stderr) {
      //console.log("STDERR:", this._stderr);
      this.output('\x1b[1;31m' + this._stderr + '\x1b[1;0m');
    }

    // Do I need to unmount the proxy filesystem?
  }

  private _currentLine: string;
  private _fs: any;
  private _fsModule: any;
  private _outputCallback: IOutputCallback;
  private _prompt: string;
  private _stdin: string = '';
  private _stdout: string = '';
  private _stderr: string = '';

  private _baseUrl: string;
  private _driveFS?: DriveFS;
  private _mountpoint: string = '/drive';
}
