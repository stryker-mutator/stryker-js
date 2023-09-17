import type { types } from '@babel/core';

export class ParseError extends Error {
  constructor(message: string, fileName: string, location: Pick<types.SourceLocation['start'], 'column' | 'line'>) {
    super(`Parse error in ${fileName} (${location.line}:${location.column}) ${message}`);
  }
}
