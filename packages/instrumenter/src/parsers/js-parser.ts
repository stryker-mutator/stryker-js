import { ParserPlugin } from '@babel/parser';
import * as babel from '@babel/core';

import { AstFormat, JSAst } from '../syntax/index.js';

import { ParserOptions } from './parser-options.js';

const { types, parseAsync } = babel;

// Note: many syntax plugins (e.g. `optionalChaining`, `nullishCoalescingOperator`,
// `classProperties`, `numericSeparator`, ...) are enabled by default since Babel 8
// and no longer need to be listed here.
const defaultPlugins: ParserPlugin[] = [
  'doExpressions',
  'exportDefaultFrom',
  'functionBind',
  'functionSent',
  'importMeta',
  ['pipelineOperator', { proposal: 'fsharp' }],
  'throwExpressions',
  'v8intrinsic',
  'partialApplication',
  'decorators',
  'jsx',
];

export function createParser({ plugins: pluginsOverride }: ParserOptions) {
  return async function parse(text: string, fileName: string): Promise<JSAst> {
    const ast = await parseAsync(text, {
      parserOpts: {
        plugins: [...(pluginsOverride ?? defaultPlugins)] as ParserPlugin[],
      },
      filename: fileName,
      sourceType: 'module',
    });
    if (types.isProgram(ast)) {
      throw new Error(
        `Expected ${fileName} to contain a babel.types.file, but was a program`,
      );
    }
    return {
      originFileName: fileName,
      rawContent: text,
      format: AstFormat.JS,
      root: ast!,
    };
  };
}
