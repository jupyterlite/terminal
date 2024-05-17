// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

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
  constructor(options: ITerminal.IOptions) {
    this._name = options.name;
  }

  /**
   * Get the name of the terminal.
   */
  get name(): string {
    return this._name;
  }

  async wsConnect(url: string) {
    console.log('==> Terminal.wsConnect', url);

    const server = new WebSocketServer(url, { mock: false });

    server.on('connection', async (socket: WebSocketClient) => {
      console.log('==> server connection', this, socket);

      socket.on('message', async (message: any) => {
        const data = JSON.parse(message) as JSONPrimitive[];
        console.log('==> socket message', data);
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
    });
  }

  private _name: string;
}
