import * as sinon from 'sinon';
import * as logging from 'stryker-api/logging';

const logger = {
  debug: sinon.stub(),
  error: sinon.stub(),
  fatal: sinon.stub(),
  info: sinon.stub(),
  isDebugEnabled: sinon.stub(),
  isErrorEnabled: sinon.stub(),
  isFatalEnabled: sinon.stub(),
  isInfoEnabled: sinon.stub(),
  isTraceEnabled: sinon.stub(),
  isWarnEnabled: sinon.stub(),
  trace: sinon.stub(),
  warn: sinon.stub()
};

sinon.stub(logging, 'getLogger').returns(logger);

beforeEach(() => {
  logger.trace.reset();
  logger.debug.reset();
  logger.info.reset();
  logger.warn.reset();
  logger.error.reset();
  logger.fatal.reset();
});

export default logger;
