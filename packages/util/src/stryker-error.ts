import { errorToString } from './errors';

export default class StrykerError extends Error {
  constructor(message: string, public readonly innerError?: Error) {
    super(`${message}${innerError ? `. Inner error: ${errorToString(innerError)}` : ''}`);
  }
}
