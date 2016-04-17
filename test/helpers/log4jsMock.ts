import * as log4js from 'log4js';
import * as sinon from 'sinon';

let logger = {
  trace: sinon.stub(),
  debug: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub(),
  error: sinon.stub(),
  fatal: sinon.stub()
};

sinon.stub(log4js, 'getLogger').returns(logger);

beforeEach(() => {
  logger.trace.reset();
  logger.debug.reset();
  logger.info.reset();
  logger.warn.reset();
  logger.error.reset();
  logger.fatal.reset();
});

export default logger;