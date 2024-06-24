// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLiteServer,
  JupyterLiteServerPlugin,
  Router
} from '@jupyterlite/server';

import { ITerminals } from './tokens';
import { Terminals } from './terminals';

/**
 * The terminals service plugin.
 */
const terminalsPlugin: JupyterLiteServerPlugin<ITerminals> = {
  id: '@jupyterlite/terminal:plugin',
  description: 'A terminal for JupyterLite',
  autoStart: true,
  provides: ITerminals,
  activate: async (app: JupyterLiteServer) => {
    console.log(
      'JupyterLab extension @jupyterlite/terminal:plugin is activated!'
    );

    const { serviceManager } = app;
    const { serverSettings, terminals } = serviceManager;
    console.log('terminals available:', terminals.isAvailable());
    console.log('terminals ready:', terminals.isReady); // Not ready
    console.log('terminals active:', terminals.isActive);

    // Not sure this is necessary?
    await terminals.ready;
    console.log('terminals ready after await:', terminals.isReady); // Ready

    return new Terminals(serverSettings.wsUrl);
  }
};

/**
 * A plugin providing the routes for the terminals service
 */
const terminalsRoutesPlugin: JupyterLiteServerPlugin<void> = {
  id: '@jupyterlite/terminal:routes-plugin',
  autoStart: true,
  requires: [ITerminals],
  activate: (app: JupyterLiteServer, terminals: ITerminals) => {
    console.log(
      'JupyterLab extension @jupyterlite/terminal:routes-plugin is activated!',
      terminals
    );

    // GET /api/terminals - List the running terminals
    app.router.get('/api/terminals', async (req: Router.IRequest) => {
      const res = await terminals.list();
      // Should return last_activity for each too,
      return new Response(JSON.stringify(res));
    });

    // POST /api/terminals - Start a terminal
    app.router.post('/api/terminals', async (req: Router.IRequest) => {
      const res = await terminals.startNew();
      // Should return last_activity too.
      return new Response(JSON.stringify(res));
    });
  }
};

export default [terminalsPlugin, terminalsRoutesPlugin];
