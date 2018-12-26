import { timeout, TimeoutExpired } from './objectUtils';

/**
 * Wraps a promise in a Task api for convenience.
 */
export class Task<T = void> {

  public get isCompleted() {
    return this._isCompleted;
  }

  public get promise() {
    return this._promise;
  }

  protected _promise: Promise<T>;
  private _isCompleted = false;
  private rejectFn: (reason: any) => void;
  private resolveFn: (value?: T | PromiseLike<T>) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  public reject(reason: any) {
    this._isCompleted = true;
    this.rejectFn(reason);
  }

  public resolve(result: T | PromiseLike<T>) {
    this._isCompleted = true;
    this.resolveFn(result);
  }
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
