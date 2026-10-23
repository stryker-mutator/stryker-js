import { createRequire } from 'module';

import * as babel from '@babel/core';

import { AstFormat, TSAst, TsxAst } from '../syntax/index.js';

import { ParserOptions } from './parser-options.js';

const { types, parseAsync } = babel;
const require = createRequire(import.meta.url);

// The TS/TSX parser only consumes `decorators`; it doesn't use `plugins` (that's
// JS-parser-only), so narrow the shared `ParserOptions` down to what's relevant here.
type TSParserOptions = Pick<ParserOptions, 'decorators'>;

/**
 * See https://babeljs.io/docs/en/babel-preset-typescript
 * @param text The text to parse
 * @param fileName The name of the file
 */
export async function parseTS(
  text: string,
  fileName: string,
  options?: TSParserOptions,
): Promise<TSAst> {
  return {
    originFileName: fileName,
    rawContent: text,
    format: AstFormat.TS,
    root: await parse(text, fileName, false, options),
  };
}

export async function parseTsx(
  text: string,
  fileName: string,
  options?: TSParserOptions,
): Promise<TsxAst> {
  return {
    root: await parse(text, fileName, true, options),
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
  options?: TSParserOptions,
): Promise<babel.types.File> {
  const decoratorsVersion = options?.decorators?.version ?? 'legacy';
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
        { version: decoratorsVersion },
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
