import { parseSync, types } from '@babel/core';

import { JSAst, AstFormat, HtmlAst, TSAst } from '../../src/syntax';

export function createHtmlAst(overrides?: Partial<HtmlAst>): HtmlAst {
  return {
    format: AstFormat.Html,
    originFileName: 'example.html',
    rawContent: '<htm></html>',
    root: {
      scripts: [],
    },
    ...overrides,
  };
}

export function createJSAst(overrides?: Partial<JSAst>): JSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  return {
    format: AstFormat.JS,
    originFileName: 'example.js',
    rawContent,
    root: parseSync(rawContent)! as types.File,
    ...overrides,
  };
}

export function createTSAst(overrides?: Partial<TSAst>): TSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  const originFileName = overrides?.originFileName ?? 'example.ts';
  return {
    format: AstFormat.TS,
    originFileName,
    rawContent,
    root: parseSync(rawContent, {
      presets: [require.resolve('@babel/preset-typescript')],
      filename: originFileName,
      plugins: [[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }]],
    })! as types.File,
    ...overrides,
  };
}
