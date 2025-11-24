// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import type { ServiceManagerPlugin, Terminal } from '@jupyterlab/services';
import {
  IServerSettings,
  ITerminalManager,
  ServerConnection,
  TerminalManager
} from '@jupyterlab/services';
import { IServiceWorkerManager } from '@jupyterlite/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

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

const terminalThemeChangePlugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlite/terminal:theme-change',
  autoStart: true,
  requires: [ILiteTerminalAPIClient, ISettingRegistry],
  optional: [IThemeManager],
  activate: (
    _: JupyterFrontEnd,
    liteTerminalAPIClient: ILiteTerminalAPIClient,
    settingRegistry: ISettingRegistry,
    themeManager?: IThemeManager
  ): void => {
    // Cache latest terminal theme so can identify if it has changed.
    let terminalTheme: string | undefined;

    themeManager?.themeChanged.connect(async (_, changedArgs) => {
      // An overall Lab theme change only affects terminals if the terminaTheme is 'inherit'.
      if (terminalTheme === 'inherit') {
        const isDarkMode = !themeManager.isLight(changedArgs.newValue);
        liteTerminalAPIClient.themeChange(isDarkMode);
      }
    });

    // There is no signal for a terminal theme change, so use settings change.
    settingRegistry
      .load('@jupyterlab/terminal-extension:plugin')
      .then(setting => {
        terminalTheme = setting.composite.theme as string;

        setting.changed.connect(() => {
          // This signal is fired for any change to the terminal settings, not just the theme.
          // Hence compare with the cached terminalTheme to identify if it has changed.
          const newTerminalTheme = setting.composite.theme as string;
          if (newTerminalTheme !== terminalTheme) {
            liteTerminalAPIClient.themeChange();
            terminalTheme = newTerminalTheme;
          }
        });
      });
  }
};

export default [
  terminalClientPlugin,
  terminalManagerPlugin,
  terminalServiceWorkerPlugin,
  terminalThemeChangePlugin
];

// Export ILiteTerminalAPIClient so that other extensions can register external commands.
export { ILiteTerminalAPIClient };
