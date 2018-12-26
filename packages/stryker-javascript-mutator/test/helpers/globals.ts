declare const sandbox: sinon.SinonSandbox;
declare const logMock: LogMock;
namespace NodeJS {
  export interface Global {
    logMock: LogMock;
    sandbox: sinon.SinonSandbox;
  }
}

type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

interface LogMock {
  debug: sinon.SinonStub;
  error: sinon.SinonStub;
  fatal: sinon.SinonStub;
  info: sinon.SinonStub;
  isDebugEnabled: sinon.SinonStub;
  isErrorEnabled: sinon.SinonStub;
  isFatalEnabled: sinon.SinonStub;
  isInfoEnabled: sinon.SinonStub;
  isLevelEnabled: sinon.SinonStub;
  isTraceEnabled: sinon.SinonStub;
  isWarnEnabled: sinon.SinonStub;
  setLevel: sinon.SinonStub;
  trace: sinon.SinonStub;
  warn: sinon.SinonStub;
}
