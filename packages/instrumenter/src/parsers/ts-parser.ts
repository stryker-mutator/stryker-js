import { types, parseAsync } from '@babel/core';

import { AstFormat, TSAst, TsxAst } from '../syntax';

/**
 * See https://babeljs.io/docs/en/babel-preset-typescript
 * @param text The text to parse
 * @param fileName The name of the file
 */
export async function parseTS(text: string, fileName: string): Promise<TSAst> {
  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.TS,
    root: await parse(text, fileName, false),
  };
}

export async function parseTsx(text: string, fileName: string): Promise<TsxAst> {
  return {
    root: await parse(text, fileName, true),
    format: AstFormat.Tsx,
    originFileName: fileName,
    rawContent: text,
  };
}

async function parse(text: string, fileName: string, isTSX: boolean): Promise<types.File> {
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
  if (ast === null) {
    throw new Error(`Expected ${fileName} to contain a babel.types.file, but it yielded null`);
  }
  if (types.isProgram(ast)) {
    throw new Error(`Expected ${fileName} to contain a babel.types.file, but was a program`);
  }
  return ast;
}
