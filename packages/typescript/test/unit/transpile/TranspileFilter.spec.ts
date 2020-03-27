import * as path from 'path';

import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';

import TranspileFilter, { DefaultFilter, TSConfigFilter } from '../../../src/transpiler/TranspileFilter';

describe('TranspileFilter', () => {
  describe('create', () => {
    it('should result in the default filter tsconfig is undefined', () => {
      const options = factory.strykerOptions();
      options.tsconfig = undefined;
      expect(TranspileFilter.create(options)).instanceof(DefaultFilter);
    });
    it('should result in the tsconfig filter if tsconfig is present with files', () => {
      const config = factory.strykerOptions();
      config.tsconfig = { fileNames: [] };
      expect(TranspileFilter.create(config)).instanceof(TSConfigFilter);
    });
  });
});

describe('DefaultFilter', () => {
  it('should only include known typescript extensions', () => {
    const sut = new DefaultFilter();
    expect(sut.isIncluded('file1.ts')).eq(true);
    expect(sut.isIncluded('file2.bin')).eq(false);
    expect(sut.isIncluded('file3.d.ts')).eq(true);
    expect(sut.isIncluded('file5.tsx')).eq(true);
  });
});

describe('TSConfigFilter', () => {
  it('should only include known files', () => {
    const sut = new TSConfigFilter({ fileNames: ['include/this.file', 'foobar.ts'] });
    expect(sut.isIncluded(path.normalize('include/this.file'))).eq(true);
    expect(sut.isIncluded('foobar.ts')).eq(true);
    expect(sut.isIncluded('baz.ts')).eq(false);
  });
});
