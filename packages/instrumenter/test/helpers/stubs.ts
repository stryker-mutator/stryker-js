import sinon from 'sinon';

import { ParserContext } from '../../src/parsers/parser-context';
import { PrinterContext } from '../../src/printers';
import { TransformerContext } from '../../src/transformers';

import { createTransformerOptions } from './factories';

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

export function transformerContextStub(): sinon.SinonStubbedInstance<TransformerContext> {
  return {
    transform: sinon.stub(),
    options: createTransformerOptions(),
  };
}
