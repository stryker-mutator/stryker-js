import * as logging from 'stryker-api/logging';
import * as sinon from 'sinon';

let log: sinon.SinonStubbedInstance<logging.Logger>;

beforeEach(() => {
  log = createLogger();
  sinon.stub(logging, 'getLogger').returns(log);
});

function createLogger(): sinon.SinonStubbedInstance<logging.Logger> {
  return {
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
}

export default function currentLogMock() {
  return log;
}
