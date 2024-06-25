import { expose } from 'comlink';

import { Shell } from './shell';

import { IWorkerTerminal } from './tokens';

class WorkerTerminal implements IWorkerTerminal {
  async initialize(options: IWorkerTerminal.IOptions): Promise<void> {
    this._options = options;
    console.log('WorkerTerminal.initialize', this._options);
  }

  async input(text: string): Promise<void> {
    await this._shell!.input(text);
  }

  async setSize(rows: number, columns: number): Promise<void> {
    await this._shell!.setSize(rows, columns);
  }

  async start(): Promise<void> {
    this._shell = new Shell(this.output, this._options!.baseUrl);
    this._shell.start();
  }

  private async output(text: string): Promise<void> {
    postMessage({
      type: 'output',
      text: text
    });
  }

  private _options: IWorkerTerminal.IOptions | null = null;
  private _shell?: Shell;
}

const obj = new WorkerTerminal();

expose(obj);
