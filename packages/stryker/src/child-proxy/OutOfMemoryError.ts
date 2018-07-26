import ChildProcessCrashedError from './ChildProcessCrashedError';

export default class OutOfMemoryError extends ChildProcessCrashedError {
    constructor(pid: number, exitCode: number) {
        super(pid, exitCode, `Process ${pid} ran out of memory`);
        this.message = `Process `;
        Error.captureStackTrace(this, OutOfMemoryError);
        // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, OutOfMemoryError.prototype);
    }
}