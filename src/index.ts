// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITerminalManager, Terminal } from '@jupyterlab/services';
import { IServiceWorkerManager } from '@jupyterlite/server';

import { LiteTerminalManager } from './manager';

/**
 * The terminal manager plugin.
 */
const terminalManagerPlugin: JupyterFrontEndPlugin<Terminal.IManager> = {
  id: '@jupyterlite/terminal:plugin',
  description: 'A terminal for JupyterLite',
  autoStart: true,
  optional: [IServiceWorkerManager],
  provides: ITerminalManager,
  activate: async (
    app: JupyterFrontEnd,
    serviceWorkerManager?: IServiceWorkerManager
  ): Promise<Terminal.IManager> => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:plugin is activated!'
    );

    console.log('DEBUG app:', app);
    console.log('DEBUG IServiceWorkerManager:', serviceWorkerManager);

    const browsingContextId = serviceWorkerManager?.browsingContextId;
    console.log('DEBUG browsingContextId:', browsingContextId);

    return new LiteTerminalManager({ browsingContextId });
  }
};

export default [terminalManagerPlugin];
