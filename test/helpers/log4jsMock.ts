import * as log4js from 'log4js';
import * as sinon from 'sinon';

let logger = {
  isTraceEnabled: sinon.stub(),
  trace: sinon.stub(),
  isDebugEnabled: sinon.stub(),
  debug: sinon.stub(),
  isInfoEnabled: sinon.stub(),
  info: sinon.stub(),
  isWarnEnabled: sinon.stub(),
  warn: sinon.stub(),
  isErrorEnabled: sinon.stub(),
  error: sinon.stub(),
  isFatalEnabled: sinon.stub(),
  fatal: sinon.stub()
};

if ((global as any).log4jsSandbox) {
  (global as any).log4jsSandbox.restore();
}

let sandbox: sinon.SinonSandbox;
(global as any).log4jsSandbox = sandbox = sinon.sandbox.create();

// Stub away even before other files are loaded and tests have started
sandbox.stub(log4js, 'getLogger').returns(logger);

beforeEach(() => {
  logger.trace.reset();
  logger.debug.reset();
  logger.info.reset();
  logger.warn.reset();
  logger.error.reset();
  logger.fatal.reset();
});

after(() => {
  // Restore for next (stryker) test run
  sandbox.restore();
  (global as any).log4jsSandbox = null;
});

export default logger;