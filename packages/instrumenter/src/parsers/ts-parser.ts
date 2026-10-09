import { createRequire } from 'module';

import * as babel from '@babel/core';

import { AstFormat, TSAst, TsxAst } from '../syntax/index.js';

const { types, parseAsync } = babel;
const require = createRequire(import.meta.url);
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

export async function parseTsx(
  text: string,
  fileName: string,
): Promise<TsxAst> {
  return {
    root: await parse(text, fileName, true),
    format: AstFormat.Tsx,
    originFileName: fileName,
    rawContent: text,
  };
}

const tsPreset: babel.PresetItem[] = [
  [require.resolve('@babel/preset-typescript'), { ignoreExtensions: true }],
];
const tsxPresets: babel.PresetItem[] = [
  ...tsPreset,
  require.resolve('@babel/preset-react'),
];

async function parse(
  text: string,
  fileName: string,
  isTSX: boolean,
): Promise<babel.types.File> {
  const ast = await parseAsync(text, {
    filename: fileName,
    parserOpts: {
      ranges: true,
    },
    configFile: false,
    babelrc: false,
    presets: isTSX ? tsxPresets : tsPreset,
    plugins: [
      [
        require.resolve('@babel/plugin-proposal-decorators'),
        { version: 'legacy' },
      ],
      require.resolve('@babel/plugin-transform-explicit-resource-management'),
    ],
  });
  if (ast === null) {
    throw new Error(
      `Expected ${fileName} to contain a babel.types.file, but it yielded null`,
    );
  }
  if (types.isProgram(ast)) {
    throw new Error(
      `Expected ${fileName} to contain a babel.types.file, but was a program`,
    );
  }
  return ast;
}
