import sinon from 'sinon';

import { testInjector } from '@stryker-mutator/test-helpers';

import { ParserContext } from '../../src/parsers/parser-context.js';
import { PrinterContext } from '../../src/printers/index.js';
import { TransformerContext } from '../../src/transformers/index.js';

import { createTransformerOptions } from './factories.js';

export function parserContextStub(): sinon.SinonStubbedInstance<ParserContext> {
  return {
    parse: sinon.stub<any>(),
  };
}

export function printerContextStub(): sinon.SinonStubbedInstance<PrinterContext> {
  return {
    print: sinon.stub(),
  };
}

export function transformerContextStub(overrides?: Partial<TransformerContext>): sinon.SinonStubbedInstance<TransformerContext> {
  return {
    ...overrides,
    transform: sinon.stub(),
    mutateDescription: true,
    options: createTransformerOptions(),
    logger: testInjector.logger,
  };
}
