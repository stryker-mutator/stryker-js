import * as path from 'path';
import { expect } from 'chai';
import ChunkSorter, { Chunk } from '../../../src/compiler/ChunkSorter';
import { createChunk } from '../../helpers/producers';

describe('ChunkSorter', () => {

  let sut: ChunkSorter;

  beforeEach(() => {
    sut = new ChunkSorter();
  });

  it('should sort chunks according to dependencies with pre-webpack 2 chunks', () => {
    const output = sut.sortedFileNames([
      createChunk({ id: '1', files: ['1.js', 'foo.js'], parents: ['2', 'notExists'] }),
      createChunk({ id: '2', files: ['2.js'], parents: ['3', '4'] }),
      createChunk({ id: '3', files: ['3.js'] }),
      createChunk({ id: '4', files: [path.resolve('4.js')], parents: ['3'] })
    ]);
    expect(output).deep.eq(['3.js', path.resolve('4.js'), '2.js', '1.js', 'foo.js']);
  });

  it('should sort chunks according to dependencies with post-webpack 2 chunks', () => {
    const chunk3: Chunk = createChunk({ id: '3', files: ['3.js'] });
    const chunk4: Chunk = createChunk({ id: '4', files: ['4.js'], parents: [chunk3] });
    const chunk2: Chunk = createChunk({ id: '2', files: ['2.js'], parents: [chunk3, chunk4] });
    const chunk1: Chunk = createChunk({ id: '1', files: ['1.js', 'foo.js'], parents: [chunk2] });
    const output = sut.sortedFileNames([
      chunk1,
      chunk2,
      chunk3,
      chunk4
    ]);
    expect(output).deep.eq(['3.js', '4.js', '2.js', '1.js', 'foo.js']);
  });

});