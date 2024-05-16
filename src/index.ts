import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlite-terminal extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlite-terminal:plugin',
  description: 'A terminal for JupyterLite',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlite-terminal is activated!');
  }
};

export default plugin;
