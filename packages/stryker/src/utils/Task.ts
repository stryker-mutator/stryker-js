import { timeout, TimeoutExpired } from './objectUtils';

/**
 * Wraps a promise in a Task api for convenience.
 */
export class Task<T = void> {

  protected _promise: Promise<T>;
  private resolveFn: (value?: T | PromiseLike<T>) => void;
  private rejectFn: (reason: any) => void;
  private _isCompleted = false;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  get promise() {
    return this._promise;
  }

  get isCompleted() {
    return this._isCompleted;
  }

  resolve(result: T | PromiseLike<T>) {
    this._isCompleted = true;
    this.resolveFn(result);
  }

  reject(reason: any) {
    this._isCompleted = true;
    this.rejectFn(reason);
  }
}

/**
 * A task that can expire after the given time.
 * If that happens, the inner promise is resolved
 */
export class ExpirableTask<T = void> extends Task<T | TimeoutExpired> {
  constructor(timeoutMS: number) {
    super();
    this._promise = timeout(this._promise, timeoutMS).then(val => {
      return val;
    });
  }
}