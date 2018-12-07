import * as sinon from 'sinon';
import { Logger } from 'stryker-api/logging';

export default class LoggerStub implements Logger {
  public error: sinon.SinonStub;
  public warn: sinon.SinonStub;
  public info: sinon.SinonStub;
  public debug: sinon.SinonStub;
  public trace: sinon.SinonStub;
  public fatal: sinon.SinonStub;
  public isTraceEnabled: sinon.SinonStub;
  public isDebugEnabled: sinon.SinonStub;
  public isInfoEnabled: sinon.SinonStub;
  public isWarnEnabled: sinon.SinonStub;
  public isErrorEnabled: sinon.SinonStub;
  public isFatalEnabled: sinon.SinonStub;

  constructor() {
    this.error = sinon.stub();
    this.warn = sinon.stub();
    this.info = sinon.stub();
    this.debug = sinon.stub();

    this.trace = sinon.stub();
    this.fatal = sinon.stub();
    this.isTraceEnabled = sinon.stub();
    this.isDebugEnabled = sinon.stub();
    this.isInfoEnabled = sinon.stub();
    this.isWarnEnabled = sinon.stub();
    this.isErrorEnabled = sinon.stub();
    this.isFatalEnabled = sinon.stub();
  }
}
