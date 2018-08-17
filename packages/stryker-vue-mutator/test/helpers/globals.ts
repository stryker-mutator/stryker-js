declare const sandbox: sinon.SinonSandbox;
namespace NodeJS {
  export interface Global {
    sandbox: sinon.SinonSandbox;
  }
}