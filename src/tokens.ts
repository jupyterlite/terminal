// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { TerminalAPI } from '@jupyterlab/services';

import { Token } from '@lumino/coreutils';

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
