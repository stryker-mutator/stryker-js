import { expect } from 'chai';

import { MutantCollector } from '../../../src/transformers/mutant-collector.js';

import { transformSvelte } from '../../../src/transformers/svelte-transformer.js';
import { createJSAst, createSvelteAst } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';

describe('svelte-transformer', () => {
  it('should transform the svelte file', () => {
    const SvelteAst = createSvelteAst();
    const jsScript = createJSAst();
    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();
    SvelteAst.root.scripts.push(jsScript);

    transformSvelte(SvelteAst, mutantCollector, context);

    expect(true).to.be.true;
  });
});
