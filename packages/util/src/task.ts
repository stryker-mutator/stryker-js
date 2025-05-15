/**
 * Wraps a promise in a Task api for convenience.
 */
export class Task<T = void> {
  protected _promise: Promise<T>;
  private resolveFn!: (value: PromiseLike<T> | T) => void;
  private rejectFn!: (reason: any) => void;
  private _isCompleted = false;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  public get promise(): Promise<T> {
    return this._promise;
  }

  public get isCompleted(): boolean {
    return this._isCompleted;
  }

  public resolve = (result: PromiseLike<T> | T): void => {
    this._isCompleted = true;
    this.resolveFn(result);
  };

  public reject: (reason: any) => void = (reason: any): void => {
    this._isCompleted = true;
    this.rejectFn(reason);
  };
}

/**
 * A task that can expire after the given time.
 */
export class ExpirableTask<T = void> extends Task<
  T | typeof ExpirableTask.TimeoutExpired
> {
  public static readonly TimeoutExpired: unique symbol =
    Symbol('TimeoutExpired');

  constructor(timeoutMS: number) {
    super();
    this._promise = ExpirableTask.timeout(this._promise, timeoutMS);
  }

  public static timeout<K>(
    promise: Promise<K>,
    ms: number,
  ): Promise<K | typeof ExpirableTask.TimeoutExpired> {
    const sleep = new Promise<K | typeof ExpirableTask.TimeoutExpired>(
      (res, rej) => {
        const timer = setTimeout(() => res(ExpirableTask.TimeoutExpired), ms);
        promise
          .then((result) => {
            clearTimeout(timer);
            res(result);
          })
          .catch((error: unknown) => {
            clearTimeout(timer);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            rej(error);
          });
      },
    );
    return sleep;
  }
}
