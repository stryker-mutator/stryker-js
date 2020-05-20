import { parse as babelParse, ParserPlugin } from '@babel/parser';

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

export async function parse(text: string, originFileName: string): Promise<JSAst> {
  return Promise.resolve({
    originFileName,
    format: AstFormat.JS,
    rawContent: text,
    root: babelParse(text, {
      sourceFilename: originFileName,
      plugins,
      sourceType: 'module',
      ranges: true,
    }),
  });
}
