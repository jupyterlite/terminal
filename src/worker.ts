import type { IDriveFSOptions } from '@jupyterlite/cockle';
import { BaseShellWorker } from '@jupyterlite/cockle';
import { DriveFS } from '@jupyterlite/services';
import { expose } from 'comlink';

type InitializeArgs = Parameters<BaseShellWorker['initialize']>;
type DownloadModuleCallback = InitializeArgs[3];

/**
 * Shell web worker that uses DriveFS via service worker.
 * Note that this is not exported as it is accessed from Shell via the filename.
 */
class ShellWorker extends BaseShellWorker {
  override async initialize(...args: InitializeArgs): Promise<void> {
    args[3] = this._wrapDownloadModuleCallback(args[3]);
    await super.initialize(...args);
  }

  /**
   * Initialize the DriveFS to mount an external file system, if available.
   */
  protected override initDriveFS(options: IDriveFSOptions): void {
    const { baseUrl, browsingContextId, fileSystem, mountpoint } = options;
    console.log('Terminal initDriveFS', baseUrl, mountpoint, browsingContextId);
    if (mountpoint !== '' && baseUrl !== undefined && browsingContextId !== undefined) {
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

  private _wrapDownloadModuleCallback(
    callback: DownloadModuleCallback
  ): DownloadModuleCallback {
    return ((packageName: string, moduleName: string, start: boolean): void => {
      if (start) {
        (self as any).Module = undefined;
        callback(packageName, moduleName, start);
        return;
      }

      const module = (self as any).Module;
      if (typeof module !== 'function') {
        callback(packageName, moduleName, start);
        return;
      }

      (self as any).Module = async (...args: any[]): Promise<any> => {
        try {
          return await module(...args);
        } finally {
          callback(packageName, moduleName, start);
        }
      };
    }) as DownloadModuleCallback;
  }
}

const worker = new ShellWorker();
expose(worker);
