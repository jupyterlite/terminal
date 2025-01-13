// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLiteServer,
  JupyterLiteServerPlugin,
  Router
} from '@jupyterlite/server';

import { TerminalManager } from './manager';
import { ITerminalManager } from './tokens';

/**
 * The terminals service plugin.
 */
const terminalsPlugin: JupyterLiteServerPlugin<ITerminalManager> = {
  id: '@jupyterlite/terminal:plugin',
  description: 'A terminal for JupyterLite',
  autoStart: true,
  provides: ITerminalManager,
  activate: async (app: JupyterLiteServer) => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:plugin is activated!'
    );

    const { serviceManager } = app;
    const { serverSettings, terminals } = serviceManager;
    console.log('terminals available:', terminals.isAvailable());
    console.log('terminals ready:', terminals.isReady); // Not ready
    console.log('terminals active:', terminals.isActive);

    // Not sure this is necessary?
    await terminals.ready;
    console.log('terminals ready after await:', terminals.isReady); // Ready

    return new TerminalManager(serverSettings.wsUrl);
  }
};

/**
 * A plugin providing the routes for the terminals service
 */
const terminalsRoutesPlugin: JupyterLiteServerPlugin<void> = {
  id: '@jupyterlite/terminal:routes-plugin',
  autoStart: true,
  requires: [ITerminalManager],
  activate: (app: JupyterLiteServer, terminalManager: ITerminalManager) => {
    console.log(
      'JupyterLite extension @jupyterlite/terminal:routes-plugin is activated!',
      terminalManager
    );

    // GET /api/terminals - List the running terminals
    app.router.get('/api/terminals', async (req: Router.IRequest) => {
      const res = await terminalManager.listRunning();
      // Should return last_activity for each too,
      return new Response(JSON.stringify(res));
    });

    // POST /api/terminals - Start a terminal
    app.router.post('/api/terminals', async (req: Router.IRequest) => {
      const res = await terminalManager.startNew();
      // Should return last_activity too.
      return new Response(JSON.stringify(res));
    });

    // DELETE /api/terminals/{terminal name} - Delete a terminal
    app.router.delete(
      '/api/terminals/(.+)',
      async (req: Router.IRequest, name: string) => {
        const exists = terminalManager.has(name);
        if (exists) {
          await terminalManager.shutdownTerminal(name);
        } else {
          const msg = `The terminal session "${name}"" does not exist`;
          console.warn(msg);
        }

        return new Response(null, { status: exists ? 204 : 404 });
      }
    );
  }
};

export default [terminalsPlugin, terminalsRoutesPlugin];
