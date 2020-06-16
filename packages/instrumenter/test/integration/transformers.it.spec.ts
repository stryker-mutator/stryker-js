import { expect } from 'chai';

import { createHtmlAst, createJSAst, createTSAst } from '../helpers/factories';
import { transform } from '../../src/transformers';
import { MutantCollector } from '../../src/transformers/mutant-collector';

describe('transformers integration', () => {
  it('should transform an html file', () => {
    const htmlAst = createHtmlAst();
    htmlAst.root.scripts.push(createJSAst({ rawContent: 'const foo = 40 + 2' }));
    const mutantCollector = new MutantCollector();
    transform(htmlAst, mutantCollector);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(htmlAst).matchSnapshot();
  });
  it('should transform a js file', () => {
    const jsAst = createJSAst({ rawContent: 'const foo = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(jsAst, mutantCollector);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(jsAst).matchSnapshot();
  });
  it('should transform a ts file', () => {
    const tsAst = createTSAst({ rawContent: 'const foo: number = 40 + 2' });
    const mutantCollector = new MutantCollector();
    transform(tsAst, mutantCollector);
    expect(mutantCollector.mutants).lengthOf(1);
    expect(tsAst).matchSnapshot();
  });
});
