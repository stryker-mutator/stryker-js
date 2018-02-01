import * as path from 'path';
import { FileKind, File, BinaryFile, TextFile } from 'stryker-api/core';
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

    ['.ico', '.png', '.zip', '.eot', '.ttf', '.woff', '.woff2'].forEach(binaryExtension => {
      it(`should collect ${binaryExtension} as a binary file`, () => {
        const binContent = Buffer.from(binaryExtension);
        const fileName = `file${binaryExtension}`;
        sut.writeFile(fileName, binContent, () => { });
        const expectedFile: BinaryFile = {
          name: path.resolve(fileName),
          content: binContent,
          kind: FileKind.Binary,
          transpiled: true,
          included: false,
          mutated: false
        };
        expect(sut.collectFiles()).deep.eq([expectedFile]);
      });
    });

    it('should collect a css files with included = false', () => {
      const fileName = 'file.css';
      const fileContent = 'body: { background: blue }';
      sut.writeFile(fileName, fileContent, () => { });
      const expectedFile: TextFile = {
        name: path.resolve(fileName),
        content: fileContent,
        kind: FileKind.Text,
        transpiled: true,
        included: false,
        mutated: false
      };
      expect(sut.collectFiles()).deep.eq([expectedFile]);
    });

    it('should collect files', () => {
      const binContent = Buffer.from('');
      sut.writeFile('bin1.ico', binContent, () => { });
      sut.writeFile('file1.js', 'data', () => { });
      const expectedFiles: File[] = [
        {
          kind: FileKind.Binary,
          content: binContent,
          name: path.resolve('bin1.ico'),
          mutated: false,
          transpiled: true,
          included: false
        },
        {
          kind: FileKind.Text,
          content: 'data',
          name: path.resolve('file1.js'),
          mutated: true,
          transpiled: true,
          included: true
        }];
      expect(sut.collectFiles()).deep.eq(expectedFiles);
    });
  });

  function actions(...actions: Array<'mkdir' | 'rmdir'>) {
    return actions;
  }

});