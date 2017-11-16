import { TextFile, FileKind, BinaryFile } from 'stryker-api/core';
import * as sinon from 'sinon';
import { Logger } from 'log4js';


export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

function factoryMethod<T>(defaults: () => T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaults(), overrides);
}

export const binaryFile = factoryMethod<BinaryFile>(() => ({
  name: 'binaryFile',
  content: Buffer.from('some binary file', 'utf8'),
  mutated: false,
  included: true,
  transpiled: true,
  kind: FileKind.Binary
}));

export const textFile = factoryMethod<TextFile>(() => ({
  name: 'file.ts',
  content: 'c = a^2 + b^2',
  mutated: true,
  included: true,
  transpiled: true,
  kind: FileKind.Text
}));

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