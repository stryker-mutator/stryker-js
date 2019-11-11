import * as path from 'path';

import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';

import OutputFileSystem from '../../../src/fs/OutputFileSystem';

describe('OutputFileSystem', () => {
  let sut: OutputFileSystem;

  beforeEach(() => {
    sut = new OutputFileSystem();
  });

  actions('mkdir', 'rmdir').forEach(action => {
    it(`should pass through "${action}" without doing anything`, done => {
      sut[action]('dir', done);
    });
  });

  it('should pass through "mkdirp" without doing anything', done => {
    sut.mkdirp('dir', done);
  });

  it('should delete files when "unlink" is called', done => {
    sut.writeFile('file1', 'data', () => {
      expect(sut.collectFiles()).lengthOf(1);
      sut.unlink('file1', () => {
        expect(sut.collectFiles()).lengthOf(0);
        done();
      });
    });
  });

  describe('when "collectFiles"', () => {
    it('should collect a css file', () => {
      const fileName = 'file.css';
      const fileContent = 'body: { background: blue }';
      sut.writeFile(fileName, fileContent, () => {});
      const expectedFile = new File(path.resolve(fileName), fileContent);
      expect(sut.collectFiles()).deep.eq([expectedFile]);
    });

    it('should collect files', () => {
      const binContent = Buffer.from('');
      sut.writeFile('bin1.ico', binContent, () => {});
      sut.writeFile('file1.js', 'data', () => {});
      const expectedFiles = [new File(path.resolve('bin1.ico'), binContent), new File(path.resolve('file1.js'), 'data')];
      expect(sut.collectFiles()).deep.eq(expectedFiles);
    });
  });

  function actions(...actions: Array<'mkdir' | 'rmdir'>) {
    return actions;
  }
});
