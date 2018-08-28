import * as logging from 'stryker-api/logging';
import * as sinon from 'sinon';

let log: sinon.SinonStubbedInstance<logging.Logger>;

beforeEach(() => {
  log = createLogger();
  sinon.stub(logging, 'getLogger').returns(log);
});

function createLogger(): sinon.SinonStubbedInstance<logging.Logger> {
  return {
    isTraceEnabled: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    trace: sinon.stub(),
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub()
  };
}

export default function currentLogMock() {
  return log;
}