interface LogMock {
  debug: sinon.SinonStub;
  error: sinon.SinonStub;
  info: sinon.SinonStub;
  warn: sinon.SinonStub;
}

declare const sandbox: sinon.SinonSandbox;
declare const logMock: LogMock;
declare namespace NodeJS {
  export interface Global {
    logMock: LogMock;
    sandbox: sinon.SinonSandbox;
  }
}
