// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { TerminalAPI } from '@jupyterlab/services';

import { Token } from '@lumino/coreutils';

import { Remote } from 'comlink';

/**
 * The token for the Terminals service.
 */
export const ITerminals = new Token<ITerminals>(
  '@jupyterlite/terminal:ITerminals'
);

/**
 * An interface for the Terminals service.
 */
export interface ITerminals {
  /**
   * List the running terminals.
   */
  list: () => Promise<TerminalAPI.IModel[]>;

  /**
   * Start a new kernel.
   */
  startNew: () => Promise<TerminalAPI.IModel>;
}

/**
 * An interface for a server-side terminal running in the browser.
 */
export interface ITerminal {
  /**
   * The name of the server-side terminal.
   */
  readonly name: string;
}

/**
 * A namespace for ITerminal statics.
 */
export namespace ITerminal {
  /**
   * The instantiation options for an ITerminal.
   */
  export interface IOptions {
    /**
     * The name of the terminal.
     */
    name: string;

    baseUrl: string;
  }
}

export interface IWorkerTerminal {
  input(text: string): Promise<void>;
  setSize(rows: number, columns: number): Promise<void>;
  start(): Promise<void>;
}

export namespace IWorkerTerminal {
  /**
   * Initialization options for a worker.
   */
  export interface IOptions {
    baseUrl: string;
  }
}

export interface IRemote extends IWorkerTerminal {
  /**
   * Handle any lazy initialization activities.
   */
  initialize(options: IWorkerTerminal.IOptions): Promise<void>;
}

/**
 * An convenience interface for Pyodide workers wrapped by a comlink Remote.
 */
export type IRemoteWorkerTerminal = Remote<IRemote>;
