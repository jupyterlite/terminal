import { expose } from 'comlink';

import type { IDriveFSOptions } from '@jupyterlite/cockle';
import { BaseShellWorker } from '@jupyterlite/cockle';
import { DriveFS } from '@jupyterlite/services';

/**
 * Shell web worker that uses DriveFS via service worker.
 * Note that this is not exported as it is accessed from Shell via the filename.
 */
class ShellWorker extends BaseShellWorker {
  /**
   * Initialize the DriveFS to mount an external file system, if available.
   */
  protected override initDriveFS(options: IDriveFSOptions): void {
    const { baseUrl, browsingContextId, fileSystem, mountpoint } = options;
    console.log('Terminal initDriveFS', baseUrl, mountpoint, browsingContextId);
    if (
      mountpoint !== '' &&
      baseUrl !== undefined &&
      browsingContextId !== undefined
    ) {
      const { FS, ERRNO_CODES, PATH } = fileSystem;
      const driveFS = new DriveFS({
        FS,
        PATH,
        ERRNO_CODES,
        baseUrl,
        driveName: '',
        mountpoint,
        browsingContextId
      });
      FS.mount(driveFS, {}, mountpoint);
      console.log('Terminal connected to shared drive');
    } else {
      console.warn('Terminal not connected to shared drive');
    }
  }
}

const worker = new ShellWorker();
expose(worker);
