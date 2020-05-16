import sinon from 'sinon';

import { ParserContext } from '../../src/parsers/parser-context';

export function parserContextStub(): sinon.SinonStubbedInstance<ParserContext> {
  return {
    parse: sinon.stub(),
  };
}
