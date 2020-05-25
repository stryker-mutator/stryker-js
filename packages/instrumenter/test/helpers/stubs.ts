import sinon from 'sinon';

import { ParserContext } from '../../src/parsers/parser-context';
import { PrinterContext } from '../../src/printers';

export function parserContextStub(): sinon.SinonStubbedInstance<ParserContext> {
  return {
    parse: sinon.stub(),
  };
}

export function printerContextStub(): sinon.SinonStubbedInstance<PrinterContext> {
  return {
    print: sinon.stub(),
  };
}
