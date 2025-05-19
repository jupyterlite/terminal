// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ITerminalManager,
  ServiceManagerPlugin,
  Terminal
} from '@jupyterlab/services';
import { IServiceWorkerManager } from '@jupyterlite/server';

import { isILiteTerminalManager, LiteTerminalManager } from './manager';

/**
 * The terminal manager plugin, replacing the JupyterLab terminal manager.
 */
const terminalManagerPlugin: ServiceManagerPlugin<Terminal.IManager> = {
  id: '@jupyterlite/terminal:plugin',
  description: 'A JupyterLite extension providing a custom terminal manager',
  autoStart: true,
  provides: ITerminalManager,
  activate: (_: null): Terminal.IManager => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:plugin is activated!'
    );
    return new LiteTerminalManager();
  }
};

/**
 * A plugin that sets the browsingContextId of the terminal manager.
 */
const browsingContextIdSetter: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlite/terminal:browsing-context-id',
  autoStart: true,
  optional: [IServiceWorkerManager],
  requires: [ITerminalManager],
  activate: (
    _: JupyterFrontEnd,
    terminalManager: Terminal.IManager,
    serviceWorkerManager?: IServiceWorkerManager
  ): void => {
    if (serviceWorkerManager !== undefined) {
      if (isILiteTerminalManager(terminalManager)) {
        const { browsingContextId } = serviceWorkerManager;
        terminalManager.browsingContextId = browsingContextId;
      } else {
        console.warn(
          'Terminal manager does not support setting browsingContextId'
        );
      }
    }
  }
};

export default [terminalManagerPlugin, browsingContextIdSetter];
