import { ChildProcessCrashedError } from './child-process-crashed-error.js';

export class OutOfMemoryError extends ChildProcessCrashedError {
  constructor(pid: number | undefined, exitCode: number) {
    super(pid, `Process ${pid} ran out of memory`, exitCode);
    this.message = 'Process ';
    Error.captureStackTrace(this, OutOfMemoryError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, OutOfMemoryError.prototype);
  }
}
