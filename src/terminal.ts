// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Shell } from '@jupyterlite/cockle';
import { JSONPrimitive } from '@lumino/coreutils';

import {
  Server as WebSocketServer,
  Client as WebSocketClient
} from 'mock-socket';

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
  }

  private async _outputCallback(text: string): Promise<void> {
    if (this._socket) {
      const ret = JSON.stringify(['stdout', text]);
      this._socket.send(ret);
    }
  }

  /**
   * Get the name of the terminal.
   */
  get name(): string {
    return this.options.name;
  }

  async wsConnect(url: string) {
    console.log('==> Terminal.wsConnect', url);

    const server = new WebSocketServer(url);

    server.on('connection', async (socket: WebSocketClient) => {
      console.log('==> server connection', this, socket);
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

      socket.on('close', async () => {
        console.log('==> socket close');
      });

      socket.on('error', async () => {
        console.log('==> socket error');
      });

      // Return handshake.
      const res = JSON.stringify(['setup']);
      console.log('==> Returning handshake via socket', res);
      socket.send(res);

      await this._shell.start();
    });
  }

  private _socket?: WebSocketClient;
  private _shell: Shell;
}
