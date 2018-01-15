import * as path from 'path';
import { FileKind, File } from 'stryker-api/core';
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

  it('should collect files when "collectFiles" is called', done => {
    const binContent = Buffer.from('');
    sut.writeFile('bin1', binContent, () => {
      sut.writeFile('file1', 'data', () => {
        const expectedFiles: File[] = [
          {
            kind: FileKind.Binary,
            content: binContent,
            name: path.resolve('bin1'),
            mutated: false,
            transpiled: true,
            included: false
          },
          {
            kind: FileKind.Text,
            content: 'data',
            name: path.resolve('file1'),
            mutated: true,
            transpiled: true,
            included: true
          }];
        expect(sut.collectFiles()).deep.eq(expectedFiles);
        done();
      });
    });
  });

  function actions(...actions: Array<'mkdir' | 'rmdir'>) {
    return actions;
  }

});