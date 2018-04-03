import * as path from 'path';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import FileSorter, { Chunk } from '../../../src/compiler/FileSorter';
import { createChunk, createTextFile } from '../../helpers/producers';

describe('FileSorter', () => {

  let file2: File;
  let file1: File;
  let file4: File;
  let file3: File;
  let fooFile: File;

  beforeEach(() => {
    file2 = createTextFile('2.js');
    file1 = createTextFile('1.js');
    file4 = createTextFile(path.resolve('4.js'));
    file3 = createTextFile('3.js');
    fooFile = createTextFile('foo.js');
  });


  it('should sort chunks according to dependencies with pre-webpack 2 chunks', () => {
    const output = FileSorter.sort([
      file2,
      file1,
      file4,
      file3,
      fooFile
    ], [
        createChunk({ id: '1', files: ['1.js', 'foo.js'], parents: ['2', 'notExists'] }),
        createChunk({ id: '2', files: ['2.js'], parents: ['3', '4'] }),
        createChunk({ id: '3', files: ['3.js'] }),
        createChunk({ id: '4', files: [path.resolve('4.js')], parents: ['3'] })
      ]);
    expect(output).deep.eq([file3, file4, file2, file1, fooFile]);
  });

  it('should sort chunks according to dependencies with post-webpack 2 chunks', () => {
    const chunk3: Chunk = createChunk({ id: '3', files: ['3.js'] });
    const chunk4: Chunk = createChunk({ id: '4', files: ['4.js'], parents: [chunk3] });
    const chunk2: Chunk = createChunk({ id: '2', files: ['2.js'], parents: [chunk3, chunk4] });
    const chunk1: Chunk = createChunk({ id: '1', files: ['1.js', 'foo.js'], parents: [chunk2] });
    const output = FileSorter.sort([
      file2,
      file1,
      file4,
      file3,
      fooFile
    ], [
        chunk1,
        chunk2,
        chunk3,
        chunk4
      ]);
    expect(output).deep.eq([file3, file4, file2, file1, fooFile]);
  });

});