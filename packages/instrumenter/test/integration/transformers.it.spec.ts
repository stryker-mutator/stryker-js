import { expect } from 'chai';

import { createHtmlAst, createJSAst, createTransformerOptions, createTSAst } from '../helpers/factories.js';
import { transform } from '../../src/transformers/index.js';
import { MutantCollector } from '../../src/transformers/mutant-collector.js';

describe('transformers integration', () => {
  it('should transform an html file', () => {
    const htmlAst = createHtmlAst();
    htmlAst.root.scripts.push(createJSAst({ rawContent: 'const foo = 40 + 2' }));
    const mutantCollector = new MutantCollector();
    transform(htmlAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(htmlAst).matchSnapshot();
  });
  it('should transform a js file', () => {
    const jsAst = createJSAst({ rawContent: 'const foo = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(jsAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(jsAst).matchSnapshot();
  });
  it('should transform a ts file', () => {
    const tsAst = createTSAst({ rawContent: 'const foo: number = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(tsAst, mutantCollector, { options: createTransformerOptions(), mutateDescription: true });
    expect(mutantCollector.mutants).lengthOf(1);
    expect(tsAst).matchSnapshot();
  });
});
