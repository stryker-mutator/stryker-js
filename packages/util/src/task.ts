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
export class ExpirableTask<T = void> extends Task<T | typeof ExpirableTask.TimeoutExpired> {
  public static readonly TimeoutExpired: unique symbol = Symbol('TimeoutExpired');

  constructor(timeoutMS: number) {
    super();
    this._promise = ExpirableTask.timeout(this._promise, timeoutMS);
  }

  public static timeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof ExpirableTask.TimeoutExpired> {
    const sleep = new Promise<T | typeof ExpirableTask.TimeoutExpired>((res, rej) => {
      const timer = setTimeout(() => res(ExpirableTask.TimeoutExpired), ms);
      promise
        .then((result) => {
          clearTimeout(timer);
          res(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          rej(error);
        });
    });
    return sleep;
  }
}
