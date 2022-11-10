import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { Logger } from '@stryker-mutator/api/src/logging/logger.js';

import { createHtmlAst, createJSAst, createTransformerOptions, createTSAst } from '../helpers/factories.js';
import { transform } from '../../src/transformers/index.js';
import { MutantCollector } from '../../src/transformers/mutant-collector.js';

describe('transformers integration', () => {
  const logger: sinon.SinonStubbedInstance<Logger> = testInjector.logger;

  it('should transform an html file', () => {
    const htmlAst = createHtmlAst();
    htmlAst.root.scripts.push(createJSAst({ rawContent: 'const foo = 40 + 2' }));
    const mutantCollector = new MutantCollector();
    transform(htmlAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true }, logger);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(htmlAst).matchSnapshot();
  });
  it('should transform a js file', () => {
    const jsAst = createJSAst({ rawContent: 'const foo = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(jsAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true }, logger);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(jsAst).matchSnapshot();
  });
  it('should transform a ts file', () => {
    const tsAst = createTSAst({ rawContent: 'const foo: number = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(tsAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true }, logger);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(tsAst).matchSnapshot();
  });
});
