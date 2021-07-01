import { types } from '@babel/core';

import { JSAst, AstFormat, HtmlAst, TSAst } from '../../src/syntax';
import { Mutant, Mutable } from '../../src/mutant';
import { ParserOptions } from '../../src/parsers';
import { InstrumenterOptions } from '../../src';
import { TransformerOptions } from '../../src/transformers';

import { parseTS, parseJS, findNodePath } from './syntax-test-helpers';

export function createParserOptions(overrides?: Partial<ParserOptions>): ParserOptions {
  return {
    plugins: null,
    ...overrides,
  };
}

export function createTransformerOptions(overrides?: Partial<TransformerOptions>): TransformerOptions {
  return {
    excludedMutations: [],
    mutationRanges: [],
    ...overrides,
  };
}

export function createInstrumenterOptions(overrides?: Partial<InstrumenterOptions>): InstrumenterOptions {
  return {
    ...createParserOptions(),
    ...createTransformerOptions(),
    ...overrides,
  };
}

export function createHtmlAst(overrides?: Partial<HtmlAst>): HtmlAst {
  return {
    format: AstFormat.Html,
    originFileName: 'example.html',
    rawContent: '<htm></html>',
    root: {
      scripts: [],
    },
    ...overrides,
  };
}

export function createJSAst(overrides?: Partial<JSAst>): JSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  return {
    format: AstFormat.JS,
    originFileName: 'example.js',
    rawContent,
    root: parseJS(rawContent),
    ...overrides,
  };
}

export function createTSAst(overrides?: Partial<TSAst>): TSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  const originFileName = overrides?.originFileName ?? 'example.ts';
  return {
    format: AstFormat.TS,
    originFileName,
    rawContent,
    root: parseTS(rawContent, originFileName),
    ...overrides,
  };
}

export function createMutant(overrides?: Partial<Mutant>): Mutant {
  return new Mutant(overrides?.id ?? '1', overrides?.fileName ?? 'example.js', overrides?.original ?? types.identifier('foo'), {
    mutatorName: overrides?.mutatorName ?? 'fooMutator',
    replacement: overrides?.replacement ?? parseJS('bar').program.body[0],
    ignoreReason: overrides?.ignoreReason,
  });
}

export function createMutable(overrides?: Partial<Mutable>): Mutable {
  return {
    mutatorName: 'fooMutator',
    replacement: findNodePath(parseJS('bar'), (t) => t.isIdentifier()).node,
    ...overrides,
  };
}
