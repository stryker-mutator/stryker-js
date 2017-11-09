declare const sandbox: sinon.SinonSandbox; 
namespace NodeJS {                         
  export interface Global {                
    sandbox: sinon.SinonSandbox;           
  }                                        
}                                          

type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};