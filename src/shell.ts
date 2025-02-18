import { BaseShell, IShell } from '@jupyterlite/cockle';

/**
 * Shell class that uses web worker that plugs into a DriveFS via the service worker.
 */
export class Shell extends BaseShell {
  /**
   * Instantiate a new Shell
   *
   * @param options The instantiation options for a new shell
   */
  constructor(options: IShell.IOptions) {
    super(options);
  }

  /**
   * Load the web worker.
   */
  protected override initWorker(options: IShell.IOptions): Worker {
    console.log('Terminal create webworker');
    return new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });
  }
}
