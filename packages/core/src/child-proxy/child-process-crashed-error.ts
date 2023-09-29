import { StrykerError } from '@stryker-mutator/util';

export class ChildProcessCrashedError extends StrykerError {
  constructor(
    public readonly pid: number | undefined,
    message: string,
    public readonly exitCode?: number,
    public readonly signal?: string,
    innerError?: Error,
  ) {
    super(message, innerError);
    Error.captureStackTrace(this, ChildProcessCrashedError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ChildProcessCrashedError.prototype);
  }
}
