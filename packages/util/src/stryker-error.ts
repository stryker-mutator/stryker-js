import { errorToString } from './errors';

export class StrykerError extends Error {
  constructor(message: string, public readonly innerError?: Error) {
    super(`${message}${innerError ? `. Inner error: ${errorToString(innerError)}` : ''}`);
  }
}
