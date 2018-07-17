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
    trace: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    debug: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    info: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    warn: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    error: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    fatal: sinon.stub(),
    isFatalEnabled: sinon.stub(),
  };
}

export const runnerOptions = factory<RunnerOptions>(() => ({
  port: 0,
  strykerOptions: { mochaOptions: {} },
  fileNames: ['src/math.js', 'test/mathSpec.js']
}));

function factory<T>(defaults: () => T): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    return Object.assign(defaults(), overrides);
  };
}