import { ParserPlugin } from '@babel/parser';
import babel from '@babel/core';

import { AstFormat, JSAst } from '../syntax/index.js';

import { ParserOptions } from './parser-options.js';

const { types, parseAsync } = babel;

const defaultPlugins: ParserPlugin[] = [
  'doExpressions',
  'objectRestSpread',
  'classProperties',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'asyncGenerators',
  'functionBind',
  'functionSent',
  'dynamicImport',
  'numericSeparator',
  'importMeta',
  'optionalCatchBinding',
  'optionalChaining',
  'classPrivateProperties',
  ['pipelineOperator', { proposal: 'minimal' }],
  'nullishCoalescingOperator',
  'bigInt',
  'throwExpressions',
  'logicalAssignment',
  'classPrivateMethods',
  'v8intrinsic',
  'partialApplication',
  ['decorators', { decoratorsBeforeExport: false }],
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
