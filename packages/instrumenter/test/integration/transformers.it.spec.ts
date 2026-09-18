import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import {
  createHtmlAst,
  createJSAst,
  createRange,
  createTemplateScript,
  createTransformerOptions,
  createTSAst,
  createVueAst,
} from '../helpers/factories.js';
import { MutantCollector } from '../../src/transformers/mutant-collector.js';
import { transform } from '../../src/transformers/index.js';

describe('transformers integration', () => {
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
      isExpressionContext: false,
    });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(htmlAst).matchSnapshot();
  });
  it('should transform a vue file', () => {
    const script = 'const foo = 40 + 2';
    const vueAst = createVueAst({
      rawContent: `<script>${script}</script>`,
      root: {
        moduleScript: createTemplateScript({
          ast: createJSAst({ rawContent: script }),
          range: createRange(8, 8 + script.length),
        }),
        additionalScripts: [],
      },
    });
    const mutantCollector = new MutantCollector();
    transform(vueAst, mutantCollector, {
      options: createTransformerOptions(),
      mutateDescription: true,
      logger: testInjector.logger,
      isExpressionContext: false,
    });
    expect(mutantCollector.mutants).lengthOf(1);
  });
  it('should transform a js file', () => {
    const jsAst = createJSAst({ rawContent: 'const foo = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(jsAst, mutantCollector, {
      options: createTransformerOptions(),
      mutateDescription: true,
      logger: testInjector.logger,
      isExpressionContext: false,
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
      isExpressionContext: false,
    });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(tsAst).matchSnapshot();
  });
});
