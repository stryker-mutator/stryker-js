import { File } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { FileCoverageData } from 'istanbul-lib-coverage';
import * as sinon from 'sinon';
import SourceFile from '../../src/SourceFile';
import TestableMutant from '../../src/TestableMutant';
import TranspiledMutant from '../../src/TranspiledMutant';
import { CoverageMaps } from '../../src/transpiler/CoverageInstrumenterTranspiler';
import { MappedLocation } from '../../src/transpiler/SourceMapper';
import TranspileResult from '../../src/transpiler/TranspileResult';
import { Logger } from 'log4js';

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type Mock<T> = Mutable<sinon.SinonStubbedInstance<T>>;

export function mock<T>(constructorFn: sinon.StubbableType<T>): Mock<T> {
  return sinon.createStubInstance(constructorFn);
}

/**
 * Use this factory method to create deep test data
 * @param defaults
 */
function factoryMethod<T>(defaultsFactory: () => T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaultsFactory(), overrides);
}

export const logger = (): Mock<Logger> => {
  return {
    _log: sinon.stub(),
    addContext: sinon.stub(),
    clearContext: sinon.stub(),
    debug: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub(),
    info: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isLevelEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    level: 'level',
    log: sinon.stub(),
    new: sinon.stub(),
    removeContext: sinon.stub(),
    trace: sinon.stub(),
    warn: sinon.stub()
  };
};

export const MAPPED_LOCATION = factoryMethod<MappedLocation>(() => ({
  fileName: 'file.js',
  location: factory.LOCATION()
}));

export const COVERAGE_MAPS = factoryMethod<CoverageMaps>(() => ({
  fnMap: {},
  statementMap: {}
}));

export const FILE_COVERAGE_DATA = factoryMethod<FileCoverageData>(() => ({
  b: {},
  branchMap: {},
  f: {},
  fnMap: {},
  path: '',
  s: {},
  statementMap: {}
}));

export const TRANSPILE_RESULT = factoryMethod<TranspileResult>(() => ({
  error: null,
  outputFiles: [factory.file(), factory.file()]
}));

export const sourceFile = () => new SourceFile(factory.file());

export const testableMutant = (fileName = 'file', mutatorName = 'foobarMutator') => new TestableMutant('1337', factory.MUTANT({
  fileName,
  mutatorName,
  range: [12, 13],
  replacement: '-'
}), new SourceFile(
  new File(fileName, Buffer.from('const a = 4 + 5'))
));

export const transpiledMutant = (fileName = 'file') =>
  new TranspiledMutant(testableMutant(fileName), TRANSPILE_RESULT(), true);
