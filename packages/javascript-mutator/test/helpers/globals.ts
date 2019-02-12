declare const sandbox: sinon.SinonSandbox;
declare const logMock: LogMock;
namespace NodeJS {
  export interface Global {
    sandbox: sinon.SinonSandbox;
    logMock: LogMock;
  }
}

type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

interface LogMock {
  setLevel: sinon.SinonStub;
  isLevelEnabled: sinon.SinonStub;
  isTraceEnabled: sinon.SinonStub;
  isDebugEnabled: sinon.SinonStub;
  isInfoEnabled: sinon.SinonStub;
  isWarnEnabled: sinon.SinonStub;
  isErrorEnabled: sinon.SinonStub;
  isFatalEnabled: sinon.SinonStub;
  trace: sinon.SinonStub;
  debug: sinon.SinonStub;
  info: sinon.SinonStub;
  warn: sinon.SinonStub;
  error: sinon.SinonStub;
  fatal: sinon.SinonStub;
}
