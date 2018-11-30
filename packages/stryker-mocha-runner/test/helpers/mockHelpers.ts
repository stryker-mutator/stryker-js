import * as sinon from 'sinon';
import { Logger } from 'stryker-api/logging';
import { RunnerOptions } from 'stryker-api/test_runner';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export function logger(): Mock<Logger> {
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
}

export const runnerOptions = factory<RunnerOptions>(() => ({
  fileNames: ['src/math.js', 'test/mathSpec.js'],
  port: 0,
  settings: { config: {} }
}));

function factory<T>(defaults: () => T): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    return Object.assign(defaults(), overrides);
  };
}
