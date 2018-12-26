import { Logger } from 'stryker-api/logging';

export default class LogMock implements Mock<Logger> {
  public debug = sandbox.stub();
  public error = sandbox.stub();
  public fatal = sandbox.stub();
  public info = sandbox.stub();

  public isDebugEnabled = sandbox.stub();
  public isErrorEnabled = sandbox.stub();
  public isFatalEnabled = sandbox.stub();
  public isInfoEnabled = sandbox.stub();
  public isLevelEnabled = sandbox.stub();
  public isTraceEnabled = sandbox.stub();
  public isWarnEnabled = sandbox.stub();

  public setLevel = sandbox.stub();

  public trace = sandbox.stub();
  public warn = sandbox.stub();
}
