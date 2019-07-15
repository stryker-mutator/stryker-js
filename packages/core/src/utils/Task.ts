import { timeout, TIMEOUT_EXPIRED } from './objectUtils';

/**
 * Wraps a promise in a Task api for convenience.
 */
export class Task<T = void> {

  protected innerPromise: Promise<T>;
  private resolveFn: (value?: T | PromiseLike<T>) => void;
  private rejectFn: (reason: any) => void;
  private innerIsCompleted = false;

  constructor() {
    this.innerPromise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  get promise() {
    return this.innerPromise;
  }

  get isCompleted() {
    return this.innerIsCompleted;
  }

  public resolve = (result: T | PromiseLike<T>): void => {
    this.innerIsCompleted = true;
    this.resolveFn(result);
  }

  public reject = (reason: any): void => {
    this.innerIsCompleted = true;
    this.rejectFn(reason);
  }
}

/**
 * A task that can expire after the given time.
 */
export class ExpirableTask<T = void> extends Task<T | typeof TIMEOUT_EXPIRED> {
  constructor(timeoutMS: number) {
    super();
    this.innerPromise = timeout(this.innerPromise, timeoutMS);
  }
}
