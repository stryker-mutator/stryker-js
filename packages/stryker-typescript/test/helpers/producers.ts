import * as sinon from 'sinon';
import { Logger } from 'log4js';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export type Constructor<T> = Function & { prototype: T };

export function mock<T>(constructorFn: Constructor<T>): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export const logger = (): Mock<Logger> => {
  return {
    setLevel: sinon.stub(),
    isLevelEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    trace: sinon.stub(),
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub()
  };
};