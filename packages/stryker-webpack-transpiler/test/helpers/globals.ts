
declare const sandbox: sinon.SinonSandbox;
declare namespace NodeJS {
  export interface Global {
    sandbox: sinon.SinonSandbox;
  }
}