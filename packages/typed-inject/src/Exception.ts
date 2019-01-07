
export default class Exception extends Error {
  constructor(message: string, readonly innerError?: Error) {
    super(`${message}${innerError ? `. Inner error: ${innerError.message}` : ''}`);
    Error.captureStackTrace(this, Exception);
    // TS recommendation: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, Exception.prototype);
  }
}
