import * as sinon from 'sinon';
import { Logger } from 'stryker-api/logging';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export type Constructor<T> = { new(...args: any[]): T };

export function mock<T>(constructorFn: Constructor<T>): sinon.SinonStubbedInstance<T> {
  return sinon.createStubInstance<T>(constructorFn);
}

export const logger = (): Mock<Logger> => {
  return {
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