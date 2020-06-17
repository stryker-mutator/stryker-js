import { ParserPlugin } from '@babel/parser';
import { parseAsync, types } from '@babel/core';

import { AstFormat, JSAst } from '../syntax';

const plugins = [
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
] as ParserPlugin[];

export async function parse(text: string, fileName: string): Promise<JSAst> {
  const ast = await parseAsync(text, {
    parserOpts: {
      plugins,
    },
    filename: fileName,
    sourceType: 'module',
  });
  if (types.isProgram(ast)) {
    throw new Error(`Expected ${fileName} to contain a babel.types.file, but was a program`);
  }
  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.JS,
    root: ast!,
  };
}
