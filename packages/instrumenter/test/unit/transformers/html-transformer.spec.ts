import { expect } from 'chai';

import { testInjector } from '@stryker-mutator/test-helpers';

import { Logger } from '@stryker-mutator/api/src/logging/logger.js';

import { transformHtml } from '../../../src/transformers/html-transformer.js';
import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { createHtmlAst, createJSAst, createTSAst } from '../../helpers/factories.js';
import { transformerContextStub } from '../../helpers/stubs.js';

describe('transformHtml', () => {
  it('should transform the scripts', () => {
    // Arrange
    const htmlAst = createHtmlAst();
    const jsScript = createJSAst();
    const tsScript = createTSAst();
    const logger: sinon.SinonStubbedInstance<Logger> = testInjector.logger;
    htmlAst.root.scripts.push(jsScript);
    htmlAst.root.scripts.push(tsScript);
    const mutantCollector = new MutantCollector();
    const context = transformerContextStub();

    // Act
    transformHtml(htmlAst, mutantCollector, context, logger);

    // Assert
    expect(context.transform).calledTwice;
    expect(context.transform).calledWith(jsScript, mutantCollector, context);
    expect(context.transform).calledWith(tsScript, mutantCollector, context);
  });
});
