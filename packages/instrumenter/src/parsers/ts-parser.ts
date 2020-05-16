import { types } from '@babel/core';
import { parseAsync } from '@babel/core';

import { AstFormat, TSAst } from '../syntax';

export async function parse(text: string, fileName: string): Promise<TSAst> {
  const ast = await parseAsync(text, {
    filename: fileName,
    parserOpts: {
      ranges: true,
      sourceFilename: fileName,
    },
    presets: [require.resolve('@babel/preset-typescript')],
    plugins: [[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }]],
  });
  if (types.isProgram(ast)) {
    throw new Error('Expected ${filename} to contain a babel.types.file, but was a program');
  }
  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.TS,
    root: ast!,
  };
}
