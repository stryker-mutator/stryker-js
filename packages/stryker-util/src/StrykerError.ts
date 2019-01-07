import { errorToString } from './errors';

export default class StrykerError extends Error {
  constructor(message: string, readonly innerError?: Error) {
    super(`${message}${innerError ? `. Inner error: ${errorToString(innerError)}` : ''}`);
    Error.captureStackTrace(this, StrykerError);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, StrykerError.prototype);
  }
}
