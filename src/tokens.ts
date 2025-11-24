import type { Terminal } from '@jupyterlab/services';
import type {
  IExternalCommand,
  IStdinReply,
  IStdinRequest
} from '@jupyterlite/cockle';
import { Token } from '@lumino/coreutils';
import type { ISignal } from '@lumino/signaling';

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
   * Register an alias that will be available in all terminals.
   * If the key has already been registered, it will be overwritten.
   */
  registerAlias(key: string, value: string): void;

  /**
   * Register an environment variable that will be available in all terminals.
   * If the key has already been registered, it will be overwritten.
   * A key with an undefined value will be deleted if already registered.
   */
  registerEnvironmentVariable(key: string, value: string | undefined): void;

  /**
   * Register an external command that will be available in all terminals.
   */
  registerExternalCommand(options: IExternalCommand.IOptions): void;

  /**
   * Signal emitted when a terminal is disposed.
   * The string argument is the terminal `name` which is the same as the Shell's `shellId`.
   */
  terminalDisposed: ISignal<this, string>;

  /**
   * Inform all terminals that the theme has changed so that they can react to it if they wish.
   */
  themeChange(isDarkMode?: boolean): void;
}
