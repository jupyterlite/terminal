import { Remote, wrap } from 'comlink';
import { IMyClass } from './defs';

interface IRemoteMyClass extends Remote<IMyClass> {}

export class Local {
  constructor() {}

  async init(): Promise<void> {
    this._worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });
    console.log('worker', this._worker);

    this._remoteObj = wrap(this._worker);
    console.log('remoteObj', this._remoteObj);

    console.log('counter', await this._remoteObj.counter);
    this._remoteObj.increment();
    console.log('counter', await this._remoteObj.counter);
  }

  private _worker?: Worker;
  private _remoteObj?: IRemoteMyClass;
}
