import StrykerError from '../utils/StrykerError';

export default class ChildProcessCrashedError extends StrykerError {
  constructor(exitCode: number | null, innerError?: Error) {
    super(`Child process exited unexpectedly (code ${exitCode === null ? 'unknown' : exitCode})`, innerError);
    Error.captureStackTrace(this, ChildProcessCrashedError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ChildProcessCrashedError.prototype);
  }
}