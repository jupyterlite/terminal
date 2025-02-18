import { expose } from 'comlink';

import { BaseShellWorker, IFileSystem } from '@jupyterlite/cockle';
import {
  ContentsAPI,
  DriveFS,
  ServiceWorkerContentsAPI
} from '@jupyterlite/contents';

/**
 * Custom DriveFS implementation using the service worker.
 */
class MyDriveFS extends DriveFS {
  createAPI(options: DriveFS.IOptions): ContentsAPI {
    return new ServiceWorkerContentsAPI(
      options.baseUrl,
      options.driveName,
      options.mountpoint,
      options.FS,
      options.ERRNO_CODES
    );
  }
}

/**
 * Shell web worker that uses DriveFS via service worker.
 * Note that this is not exported as it is accessed from Shell via the filename.
 */
class ShellWorker extends BaseShellWorker {
  /**
   * Initialize the DriveFS to mount an external file system.
   */
  protected override initDriveFS(
    driveFsBaseUrl: string,
    mountpoint: string,
    fileSystem: IFileSystem
  ): void {
    console.log('Terminal initDriveFS', driveFsBaseUrl, mountpoint);
    const { FS, ERRNO_CODES, PATH } = fileSystem;
    const driveFS = new MyDriveFS({
      FS,
      PATH,
      ERRNO_CODES,
      baseUrl: driveFsBaseUrl,
      driveName: '',
      mountpoint
    });
    FS.mount(driveFS, {}, mountpoint);
  }
}

const worker = new ShellWorker();
expose(worker);
