import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import type { Terminal } from '@jupyterlab/services';
import { ServerConnection } from '@jupyterlab/services';
import type {
  IExternalCommand,
  IShellManager,
  IStdinReply,
  IStdinRequest
} from '@jupyterlite/cockle';
import { ShellManager } from '@jupyterlite/cockle';
import type { JSONPrimitive } from '@lumino/coreutils';
import type { ISignal } from '@lumino/signaling';
import { Signal } from '@lumino/signaling';

import type { Client as WebSocketClient } from 'mock-socket';
import { Server as WebSocketServer } from 'mock-socket';

import { Shell } from './shell';
import type { ILiteTerminalAPIClient } from './tokens';

export class LiteTerminalAPIClient implements ILiteTerminalAPIClient {
  constructor(options: { serverSettings?: ServerConnection.ISettings } = {}) {
    this.serverSettings =
      options.serverSettings ?? ServerConnection.makeSettings();
    this._shellManager = new ShellManager();
  }

  /**
   * Set identifier for communicating with service worker.
   */
  set browsingContextId(browsingContextId: string) {
    console.log('LiteTerminalAPIClient browsingContextId', browsingContextId);
    this._browsingContextId = browsingContextId;
  }

  /**
   * Function that handles stdin requests received from service worker.
   */
  async handleStdin(request: IStdinRequest): Promise<IStdinReply> {
    return await this._shellManager.handleStdin(request);
  }

  get isAvailable(): boolean {
    const available = String(PageConfig.getOption('terminalsAvailable'));
    return available.toLowerCase() === 'true';
  }

  readonly serverSettings: ServerConnection.ISettings;

  async startNew(
    options?: Terminal.ITerminal.IOptions
  ): Promise<Terminal.IModel> {
    // Create shell.
    const name = options?.name ?? this._nextAvailableName();
    const { baseUrl, wsUrl } = this.serverSettings;
    const shell = new Shell({
      mountpoint: '/drive',
      baseUrl,
      wasmBaseUrl: URLExt.join(
        baseUrl,
        'extensions/@jupyterlite/terminal/static/wasm/'
      ),
      browsingContextId: this._browsingContextId,
      aliases: this._aliases,
      environment: this._environment,
      externalCommands: this._externalCommands,
      shellId: name,
      shellManager: this._shellManager,
      outputCallback: text => {
        const msg = JSON.stringify(['stdout', text]);
        shell.socket?.send(msg);
      }
    });
    this._shells.set(name, shell);

    // Hook to connect socket to shell.
    const hook = async (
      shell: Shell,
      socket: WebSocketClient
    ): Promise<void> => {
      shell.socket = socket;

      socket.on('message', async (message: any) => {
        // Message from xtermjs to pass to shell.
        const data = JSON.parse(message) as JSONPrimitive[];
        const message_type = data[0];
        const content = data.slice(1);
        await shell.ready;
        if (message_type === 'stdin') {
          await shell.input(content[0] as string);
        } else if (message_type === 'set_size') {
          const rows = content[0] as number;
          const columns = content[1] as number;
          await shell.setSize(rows, columns);
        }
      });

      // Return handshake.
      const res = JSON.stringify(['setup']);
      console.log('Terminal returning handshake via socket');
      socket.send(res);

      shell.start();
    };

    const url = URLExt.join(wsUrl, 'terminals', 'websocket', name);
    const wsServer = new WebSocketServer(url);
    wsServer.on('connection', (socket: WebSocketClient): void => {
      hook(shell, socket);
    });

    shell.disposed.connect(() => {
      this.shutdown(name);
      wsServer.close();
      this._terminalDisposed.emit(shell.shellId);
    });

    return { name };
  }

  async listRunning(): Promise<Terminal.IModel[]> {
    return this._models;
  }

  registerAlias(key: string, value: string): void {
    if (this._aliases === undefined) {
      this._aliases = {};
    }
    this._aliases[key] = value;
  }

  registerEnvironmentVariable(key: string, value: string | undefined): void {
    if (this._environment === undefined) {
      this._environment = {};
    }
    this._environment[key] = value;
  }

  registerExternalCommand(options: IExternalCommand.IOptions): void {
    this._externalCommands.push(options);
  }

  async shutdown(name: string): Promise<void> {
    const shell = this._shells.get(name);
    if (shell !== undefined) {
      shell.socket?.send(JSON.stringify(['disconnect']));
      shell.socket?.close();
      this._shells.delete(name);
      shell.dispose();
    }
  }

  get terminalDisposed(): ISignal<this, string> {
    return this._terminalDisposed;
  }

  themeChange(isDarkMode?: boolean): void {
    for (const shell of this._shells.values()) {
      shell.themeChange(isDarkMode);
    }
  }

  private get _models(): Terminal.IModel[] {
    return Array.from(this._shells.keys(), name => {
      return { name };
    });
  }

  private _nextAvailableName(): string {
    for (let i = 1; ; ++i) {
      const name = `${i}`;
      if (!this._shells.has(name)) {
        return name;
      }
    }
  }

  private _aliases?: { [key: string]: string };
  private _environment?: { [key: string]: string | undefined };
  private _browsingContextId?: string;
  private _externalCommands: IExternalCommand.IOptions[] = [];
  private _shellManager: IShellManager;
  private _shells = new Map<string, Shell>();
  private _terminalDisposed = new Signal<this, string>(this);
}
