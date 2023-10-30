import { NodePath, types } from '@babel/core';

import { JSAst, AstFormat, HtmlAst, TSAst, SvelteAst, TemplateScript, Range } from '../../src/syntax/index.js';
import { Mutant, Mutable } from '../../src/mutant.js';
import { ParserOptions } from '../../src/parsers/index.js';
import { InstrumenterOptions } from '../../src/index.js';
import { TransformerOptions } from '../../src/transformers/index.js';

import { parseTS, parseJS, findNodePath } from './syntax-test-helpers.js';

export function createParserOptions(overrides?: Partial<ParserOptions>): ParserOptions {
  return {
    plugins: null,
    ...overrides,
  };
}

export function createTransformerOptions(overrides?: Partial<TransformerOptions>): TransformerOptions {
  return {
    excludedMutations: [],
    ignorers: [],
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

export function createIdentifierNodePath(name: string): NodePath<types.Identifier> {
  return findNodePath<types.Identifier>(parseJS(name), (t) => t.isIdentifier());
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

export function createSvelteAst(overrides?: Partial<SvelteAst>): SvelteAst {
  const rawContent = overrides?.rawContent ?? '<script>let name = "temp"</script><h1>hello {name}!</h1>';
  const originFileName = overrides?.originFileName ?? 'foo.svelte';
  return {
    format: AstFormat.Svelte,
    originFileName,
    rawContent,
    root: {
      moduleScript: overrides?.root?.moduleScript,
      additionalScripts: overrides?.root?.additionalScripts ?? [],
    },
    ...overrides,
  };
}

export function createTemplateScript(overrides?: Partial<TemplateScript>): TemplateScript {
  return {
    ast: createJSAst(),
    range: { start: 26, end: 16 },
    isExpression: false,
    ...overrides,
  };
}

export function createRange(start = 0, end = 0): Range {
  return { start, end };
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

export function createSourceLocation(overrides?: Partial<babel.types.SourceLocation>): babel.types.SourceLocation {
  return {
    start: createSourcePosition({ line: 1, column: 0 }),
    end: createSourcePosition({ line: 1, column: 1 }),
    filename: 'foo.js',
    identifierName: undefined,
    ...overrides,
  };
}

export type SourcePosition = babel.types.SourceLocation['start'];
export function createSourcePosition(overrides?: Partial<SourcePosition>): SourcePosition {
  return {
    line: 0,
    column: 0,
    index: 0,
    ...overrides,
  };
}
