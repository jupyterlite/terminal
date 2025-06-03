import { Terminal } from '@jupyterlab/services';
import {
  IExternalCommand,
  IStdinReply,
  IStdinRequest
} from '@jupyterlite/cockle';
import { Token } from '@lumino/coreutils';

export const ILiteTerminalAPIClient = new Token<ILiteTerminalAPIClient>(
  '@jupyterlite/terminal:client'
);

export interface ILiteTerminalAPIClient extends Terminal.ITerminalAPIClient {
  /**
   * Identifier for communicating with service worker.
   */
  browsingContextId: string;

  /**
   * Function that handles stdin requests received from service worker.
   */
  handleStdin(request: IStdinRequest): Promise<IStdinReply>;

  /**
   * Register an external command that will be available in all terminals.
   */
  registerExternalCommand(options: IExternalCommand.IOptions): void;
}
