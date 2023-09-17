import type { types } from '@babel/core';

export class ParseError extends Error {
  constructor(message: string, fileName: string, location: Pick<types.SourceLocation['start'], "line" | "column">) {
    super(`Parse error in ${fileName} (${location.line}:${location.column}) ${message}`);
  }
}
