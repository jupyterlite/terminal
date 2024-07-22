// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JSONPrimitive } from '@lumino/coreutils';

import { proxy, wrap } from 'comlink';

import {
  Server as WebSocketServer,
  Client as WebSocketClient
} from 'mock-socket';

import { MainBufferedStdin } from './buffered_stdin';
import { ITerminal, IRemoteWorkerTerminal } from './tokens';

export class Terminal implements ITerminal {
  /**
   * Construct a new Terminal.
   */
  constructor(readonly options: ITerminal.IOptions) {
    this._bufferedStdin = new MainBufferedStdin();
    this._initWorker();
  }

  private async _initWorker(): Promise<void> {
    this._worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });

    this._remote = wrap(this._worker);
    const { baseUrl } = this.options;
    const { sharedArrayBuffer } = this._bufferedStdin;
    await this._remote.initialize({ baseUrl, sharedArrayBuffer });
    this._remote.registerCallbacks(
      proxy(this._outputCallback.bind(this)),
      proxy(this._enableBufferedStdinCallback.bind(this))
    );

    this._bufferedStdin.registerSendStdinNow(this._remote.input);
  }

  private async _enableBufferedStdinCallback(enable: boolean) {
    if (enable) {
      await this._bufferedStdin.enable();
    } else {
      await this._bufferedStdin.disable();
    }
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
          const text = content[0] as string;
          if (this._bufferedStdin.enabled) {
            await this._bufferedStdin.push(text);
          } else {
            await this._remote!.input(text);
          }
        } else if (message_type === 'set_size') {
          const rows = content[0] as number;
          const columns = content[1] as number;
          await this._remote!.setSize(rows, columns);
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

      await this._remote!.start();
    });
  }

  private _worker?: Worker;
  private _remote?: IRemoteWorkerTerminal;
  private _socket?: WebSocketClient;
  private _bufferedStdin: MainBufferedStdin;
}
