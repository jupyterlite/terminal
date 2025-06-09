// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ITerminalManager,
  ServiceManagerPlugin,
  Terminal,
  ServerConnection,
  IServerSettings,
  TerminalManager
} from '@jupyterlab/services';
import { IServiceWorkerManager } from '@jupyterlite/server';

import { WebSocket } from 'mock-socket';

import { LiteTerminalAPIClient } from './client';
import { ILiteTerminalAPIClient } from './tokens';

/**
 * Plugin containing client for in-browser terminals.
 */
const terminalClientPlugin: ServiceManagerPlugin<Terminal.ITerminalAPIClient> =
  {
    id: '@jupyterlite/terminal:client',
    description: 'The client for Lite terminals',
    autoStart: true,
    provides: ILiteTerminalAPIClient,
    optional: [IServerSettings],
    activate: (
      _: null,
      serverSettings?: ServerConnection.ISettings
    ): ILiteTerminalAPIClient => {
      return new LiteTerminalAPIClient({
        serverSettings: {
          ...ServerConnection.makeSettings(),
          ...serverSettings,
          WebSocket
        }
      });
    }
  };

/**
 * Plugin containing manager for in-browser terminals.
 */
const terminalManagerPlugin: ServiceManagerPlugin<Terminal.IManager> = {
  id: '@jupyterlite/terminal:manager',
  description: 'A JupyterLite extension providing a custom terminal manager',
  autoStart: true,
  provides: ITerminalManager,
  requires: [ILiteTerminalAPIClient],
  activate: (
    _: null,
    terminalAPIClient: Terminal.ITerminalAPIClient
  ): Terminal.IManager => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:manager activated'
    );
    return new TerminalManager({
      terminalAPIClient,
      serverSettings: terminalAPIClient.serverSettings
    });
  }
};

/**
 * Plugin that connects in-browser terminals and service worker.
 */
const terminalServiceWorkerPlugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlite/terminal:service-worker',
  autoStart: true,
  requires: [ILiteTerminalAPIClient],
  optional: [IServiceWorkerManager],
  activate: (
    _: JupyterFrontEnd,
    liteTerminalAPIClient: ILiteTerminalAPIClient,
    serviceWorkerManager?: IServiceWorkerManager
  ): void => {
    if (serviceWorkerManager !== undefined) {
      liteTerminalAPIClient.browsingContextId =
        serviceWorkerManager.browsingContextId;

      serviceWorkerManager.registerStdinHandler(
        'terminal',
        liteTerminalAPIClient.handleStdin.bind(liteTerminalAPIClient)
      );
    } else {
      console.warn('Service worker is not available for terminals');
    }
  }
};

export default [
  terminalClientPlugin,
  terminalManagerPlugin,
  terminalServiceWorkerPlugin
];

// Export ILiteTerminalAPIClient so that other extensions can register external commands.
export { ILiteTerminalAPIClient };
