import type { ICoincidentShellWorker, IDriveFSOptions } from '@jupyterlite/cockle';
import { CoincidentShellWorker } from '@jupyterlite/cockle';
import type { TDriveMethod, TDriveRequest, TDriveResponse } from '@jupyterlite/services';
import { ContentsAPI, DriveFS } from '@jupyterlite/services';
import coincident from 'coincident/worker';

/**
 * An Emscripten-compatible synchronous Contents API using shared array buffers.
 */
export class SharedBufferContentsAPI extends ContentsAPI {
  request<T extends TDriveMethod>(data: TDriveRequest<T>): TDriveResponse<T> {
    return proxy.processDriveRequest(data) as unknown as TDriveResponse<T>;
  }
}

class SharedArrayBufferFS extends DriveFS {
  createAPI(options: DriveFS.IOptions): ContentsAPI {
    return new SharedBufferContentsAPI(options);
  }
}

/**
 * Coincident worker as seen from TerminalShell in main UI thread.
 */
export interface ICoincidentTerminalShellWorker extends ICoincidentShellWorker {
  processDriveRequest<T extends TDriveMethod>(data: TDriveRequest<T>): Promise<TDriveResponse<T>>;
}

class CoincidentTerminalShellWorker extends CoincidentShellWorker {
  /**
   * Initialize the DriveFS to mount an external file system, if available.
   */
  protected override initDriveFS(options: IDriveFSOptions): void {
    const { baseUrl, fileSystem, mountpoint } = options;
    console.log('Terminal coincident initDriveFS', baseUrl, mountpoint);
    if (mountpoint !== '' && baseUrl !== undefined) {
      const { FS, ERRNO_CODES, PATH } = fileSystem;
      const driveFS = new SharedArrayBufferFS({
        FS,
        PATH,
        ERRNO_CODES,
        baseUrl,
        driveName: '',
        mountpoint
      });
      FS.mount(driveFS, {}, mountpoint);
      console.log('Terminal connected to shared drive');
    } else {
      console.warn('Terminal not connected to shared drive');
    }
  }

  override initProxy(proxy: ICoincidentTerminalShellWorker): void {
    super.initProxy(proxy);
    worker.processDriveRequest = proxy.processDriveRequest.bind(proxy);
  }

  processDriveRequest?: <T extends TDriveMethod>(
    data: TDriveRequest<T>
  ) => Promise<TDriveResponse<T>>;
}

export const proxy = (await coincident()).proxy as ICoincidentTerminalShellWorker;
export const worker = new CoincidentTerminalShellWorker();
worker.initProxy(proxy);
