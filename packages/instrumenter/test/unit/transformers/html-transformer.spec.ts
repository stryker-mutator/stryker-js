import { expect } from 'chai';

import { transformHtml } from '../../../src/transformers/html-transformer';
import { MutantCollector } from '../../../src/transformers/mutant-collector';
import { createHtmlAst, createJSAst, createTSAst } from '../../helpers/factories';
import { transformerContextStub } from '../../helpers/stubs';

describe('transformHtml', () => {
  it('should transform the scripts', () => {
    // Arrange
    const htmlAst = createHtmlAst();
    const jsScript = createJSAst();
    const tsScript = createTSAst();
    htmlAst.root.scripts.push(jsScript);
    htmlAst.root.scripts.push(tsScript);
    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    // Act
    transformHtml(htmlAst, mutantCollector, context);

    // Assert
    expect(context.transform).calledTwice;
    expect(context.transform).calledWith(jsScript, mutantCollector, context);
    expect(context.transform).calledWith(tsScript, mutantCollector, context);
  });
});
