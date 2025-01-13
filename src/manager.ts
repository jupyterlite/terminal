// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig } from '@jupyterlab/coreutils';
import { TerminalAPI } from '@jupyterlab/services';

import { Terminal } from './terminal';
import { ITerminalManager } from './tokens';

/**
 * A class to handle requests to /api/terminals.
 * Although this looks similar to a JupyterLab TerminalManager, it is really a class that
 * implements the terminal REST API.
 */
export class TerminalManager implements ITerminalManager {
  /**
   * Construct a new TerminalManager object.
   */
  constructor(wsUrl: string) {
    this._wsUrl = wsUrl;
    console.log('==> TerminalManager.constructor', this._wsUrl);
  }

  /**
   * Return whether the named terminal exists.
   */
  has(name: string): boolean {
    return this._terminals.has(name);
  }

  /**
   * List the running terminals.
   */
  async listRunning(): Promise<TerminalAPI.IModel[]> {
    const ret = [...this._terminals.values()].map(terminal => ({
      name: terminal.name
    }));
    return ret;
  }

  /**
   * Shutdown a terminal by name.
   */
  async shutdownTerminal(name: string): Promise<void> {
    const terminal = this._terminals.get(name);
    if (terminal !== undefined) {
      console.log('==> TerminalManager.shutdownTerminal', name);
      this._terminals.delete(name);
      terminal.dispose();
    }
  }

  /**
   * Start a new kernel.
   */
  async startNew(): Promise<TerminalAPI.IModel> {
    const name = this._nextAvailableName();
    console.log('==> TerminalManager.startNew', name);
    const baseUrl = PageConfig.getBaseUrl();
    const terminal = new Terminal({ name, baseUrl });
    this._terminals.set(name, terminal);

    terminal.disposed.connect(() => this.shutdownTerminal(name));

    const url = `${this._wsUrl}terminals/websocket/${name}`;
    await terminal.wsConnect(url);

    return { name };
  }

  private _nextAvailableName(): string {
    for (let i = 1; ; ++i) {
      const name = `${i}`;
      if (!this._terminals.has(name)) {
        return name;
      }
    }
  }

  private _wsUrl: string;
  private _terminals: Map<string, Terminal> = new Map();
}
