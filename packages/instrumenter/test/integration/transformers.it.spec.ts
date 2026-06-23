import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import {
  createHtmlAst,
  createJSAst,
  createTransformerOptions,
  createTSAst,
} from '../helpers/factories.js';
import { instrumenterTokens } from '../../src/instrumenter-tokens.js';
import { SvelteTemplateExpressionContext } from '../../src/frameworks/svelte-template-expression-context.js';
import { createAllMutators } from '../../src/mutators/mutate.js';
import { createTransformBabel } from '../../src/transformers/babel-transformer.js';
import { MutantCollector } from '../../src/transformers/mutant-collector.js';
import { createTransformSvelte } from '../../src/transformers/svelte-transformer.js';
import { createTransform } from '../../src/transformers/transformer.js';

describe('transformers integration', () => {
  let transform: ReturnType<typeof createTransform>;

  beforeEach(() => {
    transform = testInjector.injector
      .provideValue(
        instrumenterTokens.svelteTemplateExpressionContext,
        new SvelteTemplateExpressionContext(),
      )
      .provideFactory(instrumenterTokens.mutators, createAllMutators)
      .provideFactory(instrumenterTokens.babelTransformer, createTransformBabel)
      .provideFactory(
        instrumenterTokens.svelteTransformer,
        createTransformSvelte,
      )
      .injectFunction(createTransform);
  });

  it('should transform an html file', () => {
    const htmlAst = createHtmlAst();
    htmlAst.root.scripts.push(
      createJSAst({ rawContent: 'const foo = 40 + 2' }),
    );
    const mutantCollector = new MutantCollector();
    transform(htmlAst, mutantCollector, {
      options: createTransformerOptions(),
      mutateDescription: true,
      logger: testInjector.logger,
    });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(htmlAst).matchSnapshot();
  });
  it('should transform a js file', () => {
    const jsAst = createJSAst({ rawContent: 'const foo = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(jsAst, mutantCollector, {
      options: createTransformerOptions(),
      mutateDescription: true,
      logger: testInjector.logger,
    });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(jsAst).matchSnapshot();
  });
  it('should transform a ts file', () => {
    const tsAst = createTSAst({ rawContent: 'const foo: number = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(tsAst, mutantCollector, {
      options: createTransformerOptions(),
      mutateDescription: true,
      logger: testInjector.logger,
    });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(tsAst).matchSnapshot();
  });
});
