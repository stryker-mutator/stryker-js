import * as sinon from 'sinon';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: new (...args: any[]) => T | any): Mock<T>;
export function mock<T>(constructorFn: new (...args: any[]) => T): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}
