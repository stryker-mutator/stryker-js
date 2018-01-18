import * as path from 'path';
import { FileKind, File, TextFile } from 'stryker-api/core';
import { expect } from 'chai';
import OutputFileSystem from '../../../src/fs/OutputFileSystem';
import { createChunk, Mock, createMockInstance } from '../../helpers/producers';
import ChunkSorter, * as chunkSorterModule from '../../../src/compiler/ChunkSorter';

describe('OutputFileSystem', () => {

  let sut: OutputFileSystem;
  let chunkSorterMock: Mock<ChunkSorter>;

  beforeEach(() => {
    sut = new OutputFileSystem();
    chunkSorterMock = createMockInstance(ChunkSorter);
    sandbox.stub(chunkSorterModule, 'default').returns(chunkSorterMock);
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
      expect(sut.collectFiles([])).lengthOf(1);
      sut.unlink('file1', () => {
        expect(sut.collectFiles([])).lengthOf(0);
        done();
      });
    });
  });

  describe('when "collectFiles"', () => {

    it('should collect files', done => {
      const binContent = Buffer.from('');
      chunkSorterMock.sortedFileNames.returns([]);
      sut.writeFile('bin1.ico', binContent, () => {
        sut.writeFile('file1', 'data', () => {
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
              name: path.resolve('file1'),
              mutated: true,
              transpiled: true,
              included: true
            }];
          expect(sut.collectFiles([])).deep.eq(expectedFiles);
          done();
        });
      });
    });

    it('should sort the files based on given chunks', () => {
      // Arrange
      const expectedChunks = [createChunk({ id: '1' })];
      chunkSorterMock.sortedFileNames.returns(['1', '2', '3']);
      sut.writeFile('2', '2', () => { });
      sut.writeFile('1', '1', () => { });
      sut.writeFile('3', '3', () => { });
      const expectedFiles: TextFile[] = [
        {
          kind: FileKind.Text,
          content: '1',
          name: path.resolve('1'),
          mutated: true,
          transpiled: true,
          included: true
        },
        {
          kind: FileKind.Text,
          content: '2',
          name: path.resolve('2'),
          mutated: true,
          transpiled: true,
          included: true
        },
        {
          kind: FileKind.Text,
          content: '3',
          name: path.resolve('3'),
          mutated: true,
          transpiled: true,
          included: true
        },
      ];

      // Act
      const actualResult = sut.collectFiles(expectedChunks);


      // Assert
      expect(actualResult).deep.eq(expectedFiles);
    });

  });


  function actions(...actions: Array<'mkdir' | 'rmdir'>) {
    return actions;
  }

});