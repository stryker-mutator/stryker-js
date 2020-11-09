import { types } from '@babel/core';
import { parseAsync } from '@babel/core';

import { AstFormat, TSAst } from '../syntax';

/**
 * See https://babeljs.io/docs/en/babel-preset-typescript
 * @param text The text to parse
 * @param fileName The name of the file
 */
export async function parse(text: string, fileName: string): Promise<TSAst> {
  const isTSX = fileName.endsWith('x');
  const ast = await parseAsync(text, {
    filename: fileName,
    parserOpts: {
      ranges: true,
    },
    configFile: false,
    babelrc: false,
    presets: [[require.resolve('@babel/preset-typescript'), { isTSX, allExtensions: true }]],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-proposal-private-methods'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    ],
  });
  if (types.isProgram(ast)) {
    throw new Error(`Expected ${fileName} to contain a babel.types.file, but was a program`);
  }
  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.TS,
    root: ast!,
  };
}
