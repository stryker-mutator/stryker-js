import { parse, types } from '@babel/core';

import { JSAst, AstFormat } from '../../src/syntax';

export function createJSAst(overrides?: Partial<JSAst>): JSAst {
  const rawContent = overrides?.rawContent || 'foo.bar(41, 1)';
  return {
    format: AstFormat.JS,
    originFileName: 'example.js',
    rawContent,
    root: parse(rawContent)! as types.File,
    ...overrides,
  };
}
