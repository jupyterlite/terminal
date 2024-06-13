// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JupyterFileSystem, Shell, IFileSystem } from '@jupyterlite/cockle';

import { JSONPrimitive } from '@lumino/coreutils';

import {
  Server as WebSocketServer,
  Client as WebSocketClient
} from 'mock-socket';

import { ITerminal } from './tokens';
import { Local } from './local';

export class Terminal implements ITerminal {
  /**
   * Construct a new Terminal.
   */
  constructor(options: ITerminal.IOptions) {
    this._name = options.name;
    this._fs = new JupyterFileSystem(options.contentsManager);
    console.log('==> new Terminal', this._name, this._fs);
    this._local = new Local();
  }

  /**
   * Get the name of the terminal.
   */
  get name(): string {
    return this._name;
  }

  async wsConnect(url: string) {
    console.log('==> Terminal.wsConnect', url);

    // const server = new WebSocketServer(url, { mock: false });
    const server = new WebSocketServer(url);

    server.on('connection', async (socket: WebSocketClient) => {
      console.log('==> server connection', this, socket);

      const outputCallback = async (output: string) => {
        console.log('==> recv from shell:', output);
        const ret = JSON.stringify(['stdout', output]);
        socket.send(ret);
      };

      this._shell = new Shell(this._fs, outputCallback);
      console.log('==> shell', this._shell);

      await this._local.init();

      socket.on('message', async (message: any) => {
        const data = JSON.parse(message) as JSONPrimitive[];
        console.log('==> socket message', data);
        const message_type = data[0];
        const content = data.slice(1);

        if (message_type === 'stdin') {
          await this._shell!.input(content[0] as string);
        } else if (message_type === 'set_size') {
          const rows = content[0] as number;
          const columns = content[1] as number;
          await this._shell!.setSize(rows, columns);
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

      await this._shell!.start();
    });
  }

  private _name: string;
  private _fs: IFileSystem;
  private _shell?: Shell;
  private _local: Local;
}
