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

  public get promise() {
    return this._promise;
  }

  public get isCompleted() {
    return this._isCompleted;
  }

  public resolve = (result: T | PromiseLike<T>): void => {
    this._isCompleted = true;
    this.resolveFn(result);
  };

  public reject = (reason: any): void => {
    this._isCompleted = true;
    this.rejectFn(reason);
  };
}

/**
 * A task that can expire after the given time.
 */
export class ExpirableTask<T = void> extends Task<T | typeof TimeoutExpired> {
  constructor(timeoutMS: number) {
    super();
    this._promise = timeout(this._promise, timeoutMS);
  }
}
