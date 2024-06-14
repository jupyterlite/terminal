import { expose } from 'comlink';
import { IMyClass } from './defs';

class MyClass implements IMyClass {
  get counter(): number {
    return this._counter;
  }

  increment(): void {
    this._counter += 1;
  }

  private _counter: number = 0;
}

const obj = new MyClass();

expose(obj);
