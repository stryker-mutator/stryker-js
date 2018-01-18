
interface LogMock {
   debug: sinon.SinonStub;
   info: sinon.SinonStub;
   warn: sinon.SinonStub;
   error: sinon.SinonStub;
}

declare const sandbox: sinon.SinonSandbox;
declare const logMock: LogMock;
declare namespace NodeJS {
  export interface Global {
    sandbox: sinon.SinonSandbox;
    logMock: LogMock;
  }
}