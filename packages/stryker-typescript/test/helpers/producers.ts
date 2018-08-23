import * as sinon from 'sinon';
import { Logger } from 'stryker-api/logging';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export type Constructor<T> = Function & { prototype: T };

export function mock<T>(constructorFn: Constructor<T>): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export const logger = (): Mock<Logger> => {
  return {
    debug: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub(),
    info: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    trace: sinon.stub(),
    warn: sinon.stub()
  };
};
