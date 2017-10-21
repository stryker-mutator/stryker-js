import * as sinon from 'sinon';
import { FileDescriptor, FileKind } from 'stryker-api/core';
import { Logger } from 'log4js';
import { RunnerOptions } from 'stryker-api/test_runner';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};


export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export function logger(): Mock<Logger> {
  return {
    setLevel: sinon.stub(),
    isLevelEnabled: sinon.stub(),
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

export const runnerOptions = factory<RunnerOptions>(() => ({ files: [fileDescriptor()], port: 0, strykerOptions: {} }));

export const fileDescriptor = factory<FileDescriptor>(() => ({ name: 'file.js', included: true, mutated: true, transpiled: true, kind: FileKind.Text }));

function factory<T>(defaults: () => T): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    return Object.assign(defaults(), overrides);
  };
}