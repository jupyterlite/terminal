// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IShell } from '@jupyterlite/cockle';
import { JSONPrimitive } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import {
  Server as WebSocketServer,
  Client as WebSocketClient
} from 'mock-socket';

import { Shell } from './shell';
import { ITerminal } from './tokens';

export class Terminal implements ITerminal {
  /**
   * Construct a new Terminal.
   */
  constructor(readonly options: ITerminal.IOptions) {
    this._shell = new Shell({
      mountpoint: '/drive',
      driveFsBaseUrl: options.baseUrl,
      wasmBaseUrl:
        options.baseUrl + 'extensions/@jupyterlite/terminal/static/wasm/',
      outputCallback: this._outputCallback.bind(this)
    });
    this._shell.disposed.connect(() => this.dispose());
  }

  private _outputCallback(text: string): void {
    if (this._socket) {
      const ret = JSON.stringify(['stdout', text]);
      this._socket.send(ret);
    }
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    console.log('Terminal.dispose');
    this._isDisposed = true;

    if (this._socket !== undefined) {
      // Disconnect from frontend.
      this._socket.send(JSON.stringify(['disconnect']));
      this._socket.close();
      this._socket = undefined;
    }

    if (this._server !== undefined) {
      this._server.close();
      this._server = undefined;
    }

    this._shell.dispose();
    this._disposed.emit();
  }

  get disposed(): ISignal<this, void> {
    return this._disposed;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Get the name of the terminal.
   */
  get name(): string {
    return this.options.name;
  }

  async wsConnect(url: string) {
    console.log('Terminal wsConnect', url);
    this._server = new WebSocketServer(url);

    this._server.on('connection', async (socket: WebSocketClient) => {
      console.log('Terminal server connection');
      if (this._socket !== undefined) {
        this._socket.send(JSON.stringify(['disconnect']));
        this._socket.close();
        this._socket = undefined;
      }
      this._socket = socket;

      socket.on('message', async (message: any) => {
        const data = JSON.parse(message) as JSONPrimitive[];
        //console.log('==> socket message', data);
        const message_type = data[0];
        const content = data.slice(1);

        if (message_type === 'stdin') {
          await this._shell.input(content[0] as string);
        } else if (message_type === 'set_size') {
          const rows = content[0] as number;
          const columns = content[1] as number;
          await this._shell.setSize(rows, columns);
        }
      });

      socket.on('close', () => {
        console.log('Terminal socket close');
      });

      socket.on('error', () => {
        console.log('Terminal socket error');
      });

      // Return handshake.
      const res = JSON.stringify(['setup']);
      console.log('Terminal returning handshake via socket');
      socket.send(res);

      if (!this._running) {
        this._running = true;
        await this._shell.start();
      }
    });
  }

  private _disposed = new Signal<this, void>(this);
  private _isDisposed = false;
  private _server?: WebSocketServer;
  private _socket?: WebSocketClient;
  private _shell: IShell;
  private _running = false;
}
