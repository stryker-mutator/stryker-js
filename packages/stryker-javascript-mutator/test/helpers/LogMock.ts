import { Logger } from 'log4js';
import { SinonStub } from 'sinon';

export default class LogMock implements Mock<Logger> {
  setLevel: SinonStub = sandbox.stub();
  isLevelEnabled = sandbox.stub();
  isTraceEnabled = sandbox.stub();
  isDebugEnabled = sandbox.stub();
  isInfoEnabled = sandbox.stub();
  isWarnEnabled = sandbox.stub();
  isErrorEnabled = sandbox.stub();
  isFatalEnabled = sandbox.stub();
  trace = sandbox.stub();
  debug = sandbox.stub();
  info = sandbox.stub();
  warn = sandbox.stub();
  error = sandbox.stub();
  fatal = sandbox.stub();
}