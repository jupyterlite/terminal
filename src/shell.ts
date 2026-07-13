import type { Contents } from '@jupyterlab/services';
import type { ICoincidentShellWorker, IComlinkShellWorker, IShell } from '@jupyterlite/cockle';
import { BaseShell } from '@jupyterlite/cockle';
import type { TDriveMethod, TDriveRequest } from '@jupyterlite/services';
import { DriveContentsProcessor } from '@jupyterlite/services';
import type { Client as WebSocketClient } from 'mock-socket';
import type { ICoincidentTerminalShellWorker } from './coincident.worker';

export interface ITerminalShell extends IShell {
  socket?: WebSocketClient;
}

export namespace ITerminalShell {
  export interface IOptions extends IShell.IOptions {
    /**
     * The Jupyterlite content manager, used by coincident web worker DriveFS.
     */
    contentsManager?: Contents.IManager;
  }
}

/**
 * Shell class that uses web worker that plugs into a DriveFS via the service worker or shared
 * array buffer.
 */
export class TerminalShell extends BaseShell {
  /**
   * Instantiate a new Shell
   *
   * @param options The instantiation options for a new shell
   */
  constructor(options: ITerminalShell.IOptions) {
    super(options);
    this._contentsManager = options.contentsManager;
  }

  /**
   * Override base class createRemote to add handler for SharedArrayBuffer DriveFS request.
   */
  protected createRemote(
    options: IShell.IOptions & { worker: Worker }
  ): ICoincidentShellWorker | IComlinkShellWorker {
    const remote = super.createRemote(options);

    if (this.workerType === 'coincident') {
      (remote as ICoincidentTerminalShellWorker).processDriveRequest = async <T extends TDriveMethod>(
        data: TDriveRequest<T>
      ) => {
        if (this._contentsProcessor === undefined) {
          this._contentsProcessor = new DriveContentsProcessor({
            contentsManager: this._contentsManager!
          });
        }
        return await this._contentsProcessor.processDriveRequest(data);
      };
    }

    return remote;
  }

  /**
   * Load the correct web worker.
   */
  protected override initWorker(options: ITerminalShell.IOptions): Worker {
    if (this.workerType === 'coincident') {
      return new Worker(new URL('./coincident.worker.js', import.meta.url), { type: 'module' });
    } else {
      return new Worker(new URL('./comlink.worker.js', import.meta.url), { type: 'module' });
    }
  }

  socket?: WebSocketClient;

  private _contentsManager: Contents.IManager | undefined;
  private _contentsProcessor: DriveContentsProcessor | undefined;
}
