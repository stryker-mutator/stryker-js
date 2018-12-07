import { Logger } from 'stryker-api/logging';
import { SinonStub } from 'sinon';

export default class LogMock implements Mock<Logger> {
  public setLevel: SinonStub = sandbox.stub();
  public isLevelEnabled = sandbox.stub();
  public isTraceEnabled = sandbox.stub();
  public isDebugEnabled = sandbox.stub();
  public isInfoEnabled = sandbox.stub();
  public isWarnEnabled = sandbox.stub();
  public isErrorEnabled = sandbox.stub();
  public isFatalEnabled = sandbox.stub();
  public trace = sandbox.stub();
  public debug = sandbox.stub();
  public info = sandbox.stub();
  public warn = sandbox.stub();
  public error = sandbox.stub();
  public fatal = sandbox.stub();
}
