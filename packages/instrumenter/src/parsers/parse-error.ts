import { types } from '@babel/core';

export class ParseError extends Error {
  constructor(message: string, fileName: string, location: types.SourceLocation['start']) {
    super(`Parse error in ${fileName} (${location.line}:${location.column}) ${message}`);
  }
}
