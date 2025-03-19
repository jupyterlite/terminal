// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITerminalManager, Terminal } from '@jupyterlab/services';

import { LiteTerminalManager } from './manager';

/**
 * The terminal manager plugin.
 */
const terminalManagerPlugin: JupyterFrontEndPlugin<Terminal.IManager> = {
  id: '@jupyterlite/terminal:plugin',
  description: 'A terminal for JupyterLite',
  autoStart: true,
  provides: ITerminalManager,
  activate: async (app: JupyterFrontEnd): Promise<Terminal.IManager> => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:plugin is activated!'
    );
    return new LiteTerminalManager();
  }
};

export default [terminalManagerPlugin];
