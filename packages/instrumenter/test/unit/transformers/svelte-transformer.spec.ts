import { expect } from 'chai';
import sinon from 'sinon';

import { transformBabel } from '../../../src/transformers/babel-transformer.js';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';

import { transformSvelte } from '../../../src/transformers/svelte-transformer.js';
import { createJSAst, createSvelteAst, JSAstToSvelteScriptTag } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';

describe('svelte-transformer', () => {
  it('should transform the svelte file', () => {
    const script = 'let name = "test"';
    const svelte = `<script>${script}</script><h1>hello!</h1>`;
    const jsAstOriginal = createJSAst({ rawContent: script });
    const jsAst = createJSAst({ rawContent: script });
    const svelteScriptTag = JSAstToSvelteScriptTag(jsAst, 8, 25);
    const svelteAst = createSvelteAst({ rawContent: svelte, root: { mainScript: svelteScriptTag, additionalScripts: [] } });

    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    context.transform.withArgs(jsAst, sinon.match.any, sinon.match.any);
    transformBabel(jsAst, mutantCollector, context);

    transformSvelte(svelteAst, mutantCollector, context);

    expect(svelteAst.root.mainScript).not.eq(jsAstOriginal);
  });
});
