
/**
 * Wraps a promise in a Task api for convenience.
 */
export default class Task<T> {

  private _promise: Promise<T>;
  private resolveFn: (value?: T | PromiseLike<T>) => void;
  private rejectFn: (reason: any) => void;
  private _isResolved = false;
  private timeout: NodeJS.Timer;

  constructor(timeoutMs?: number, private timeoutHandler?: () => PromiseLike<T>) {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
    if (timeoutMs) {
      this.timeout = setTimeout(() => this.handleTimeout(), timeoutMs);
    }
  }

  get isResolved() {
    return this._isResolved;
  }

  get promise() {
    return this._promise;
  }

  handleTimeout() {
    if (this.timeoutHandler) {
      this.timeoutHandler().then(val => this.resolve(val));
    } else {
      this.resolve(undefined);
    }
  }

  chainTo(promise: Promise<T>) {
    promise.then(value => this.resolve(value), reason => this.reject(reason));
  }

  resolve(result: undefined | T | PromiseLike<T>) {
    this.resolveTimeout();
    this.resolveFn(result);
  }

  reject(reason: any) {
    this.resolveTimeout();
    this.rejectFn(reason);
  }

  private resolveTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this._isResolved = true;
  }
}