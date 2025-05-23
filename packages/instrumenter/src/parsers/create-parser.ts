import path from 'path';

import { AstByFormat, AstFormat } from '../syntax/index.js';

import { createParser as createJSParser } from './js-parser.js';
import { parseTS, parseTsx } from './ts-parser.js';
import { parse as htmlParse } from './html-parser.js';
import { parse as svelteParse } from './svelte-parser.js';
import { ParserOptions } from './parser-options.js';

export function createParser(
  parserOptions: ParserOptions,
): <T extends AstFormat = AstFormat>(
  code: string,
  fileName: string,
  formatOverride?: T,
) => Promise<AstByFormat[T]> {
  const jsParse = createJSParser(parserOptions);
  return async function parse<T extends AstFormat = AstFormat>(
    code: string,
    fileName: string,
    formatOverride?: T,
  ): Promise<AstByFormat[T]> {
    const format = getFormat(fileName, formatOverride);
    if (!format) {
      const ext = path.extname(fileName).toLowerCase();
      throw new Error(
        `Unable to parse ${fileName}. No parser registered for ${ext}!`,
      );
    }
    switch (format) {
      case AstFormat.JS:
        return jsParse(code, fileName) as Promise<AstByFormat[T]>;
      case AstFormat.Tsx:
        return parseTsx(code, fileName) as Promise<AstByFormat[T]>;
      case AstFormat.TS:
        return parseTS(code, fileName) as Promise<AstByFormat[T]>;
      case AstFormat.Html:
        return htmlParse(code, fileName, { parse }) as Promise<AstByFormat[T]>;
      case AstFormat.Svelte:
        return svelteParse(code, fileName, { parse }) as Promise<
          AstByFormat[T]
        >;
    }
  };
}

export function getFormat(
  fileName: string,
  override?: AstFormat,
): AstFormat | undefined {
  if (override) {
    return override;
  } else {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.js':
      case '.jsx':
      case '.mjs':
      case '.cjs':
        return AstFormat.JS;
      case '.mts':
      case '.cts':
      case '.ts':
        return AstFormat.TS;
      case '.tsx':
        return AstFormat.Tsx;
      case '.vue':
      case '.html':
      case '.htm':
        return AstFormat.Html;
      case '.svelte':
        return AstFormat.Svelte;
      default:
        return;
    }
  }
}
