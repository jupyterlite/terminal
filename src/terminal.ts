import { ServerConnection, Terminal } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';
import { Shell } from './shell';
import { IShell, IShellManager } from '@jupyterlite/cockle';

/**
 * An implementation of a terminal interface.
 */
export class LiteTerminalConnection implements Terminal.ITerminalConnection {
  /**
   * Construct a new terminal session.
   */
  constructor(options: LiteTerminalConnection.IOptions) {
    this._serverSettings = options.serverSettings!;
    const { baseUrl } = this._serverSettings;
    const { browsingContextId, shellManager } = options;

    this._shell = new Shell({
      mountpoint: '/drive',
      baseUrl,
      wasmBaseUrl: baseUrl + 'extensions/@jupyterlite/terminal/static/wasm/',
      browsingContextId,
      shellId: options.model.name,
      shellManager,
      outputCallback: this._outputCallback.bind(this)
    });
    this._shell.disposed.connect(() => this.dispose());

    this._shell.start().then(() => this._updateConnectionStatus('connected'));
  }

  /**
   * The current connection status of the terminal connection.
   */
  get connectionStatus(): Terminal.ConnectionStatus {
    return this._connectionStatus;
  }

  /**
   * A signal emitted when the terminal connection status changes.
   */
  get connectionStatusChanged(): ISignal<this, Terminal.ConnectionStatus> {
    return this._connectionStatusChanged;
  }

  /**
   * Dispose of the resources held by the session.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;
    this._shell.dispose();
    this._disposed.emit();

    this._updateConnectionStatus('disconnected');

    Signal.clearData(this);
  }

  /**
   * A signal emitted when the session is disposed.
   */
  get disposed(): ISignal<this, void> {
    return this._disposed;
  }

  /**
   * Test whether the session is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * A signal emitted when a message is received from the server.
   */
  get messageReceived(): ISignal<
    Terminal.ITerminalConnection,
    Terminal.IMessage
  > {
    return this._messageReceived;
  }

  /**
   * Get the model for the terminal session.
   */
  get model(): Terminal.IModel {
    return { name: this._shell.shellId };
  }

  /**
   * Get the name of the terminal session.
   */
  get name(): string {
    return this._shell.shellId;
  }

  /**
   * Reconnect to a terminal.
   *
   * #### Notes
   * This may try multiple times to reconnect to a terminal, and will sever
   * any existing connection.
   */
  async reconnect(): Promise<void> {
    console.log('==> LiteTerminalConnection.reconnect not implemented');
  }

  /**
   * Send a message to the terminal session.
   *
   * #### Notes
   * If the connection is down, the message will be queued for sending when
   * the connection comes back up.
   */
  send(message: Terminal.IMessage): void {
    const { content } = message;
    if (content === undefined) {
      return;
    }

    switch (message.type) {
      case 'stdin':
        this._shell.input(content[0] as string); // async
        break;
      case 'set_size': {
        const rows = content[0] as number;
        const columns = content[1] as number;
        this._shell.setSize(rows, columns); // async
        break;
      }
    }
  }

  /**
   * The server settings for the session.
   */
  get serverSettings(): ServerConnection.ISettings {
    return this._serverSettings;
  }

  /**
   * Shut down the terminal session.
   */
  async shutdown(): Promise<void> {
    this.dispose();
  }

  private _outputCallback(text: string): void {
    // 'stdout' or 'disconnect' as MessageType.
    // Cockle is not yet using the 'disconnect'.
    this._messageReceived.emit({ type: 'stdout', content: [text] });
  }

  /**
   * Handle connection status changes.
   */
  private _updateConnectionStatus(
    connectionStatus: Terminal.ConnectionStatus
  ): void {
    if (this._connectionStatus === connectionStatus) {
      return;
    }

    this._connectionStatus = connectionStatus;

    // Notify others that the connection status changed.
    this._connectionStatusChanged.emit(connectionStatus);
  }

  private _isDisposed = false;
  private _disposed = new Signal<this, void>(this);

  private _serverSettings: ServerConnection.ISettings;
  private _connectionStatus: Terminal.ConnectionStatus = 'connecting';
  private _connectionStatusChanged = new Signal<
    this,
    Terminal.ConnectionStatus
  >(this);
  private _messageReceived = new Signal<this, Terminal.IMessage>(this);

  private _shell: IShell;
}

export namespace LiteTerminalConnection {
  export interface IOptions extends Terminal.ITerminalConnection.IOptions {
    /**
     * The ID of the browsing context where the request originated.
     */
    browsingContextId?: string;

    shellManager: IShellManager;
  }
}
