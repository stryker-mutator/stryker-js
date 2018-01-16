import * as path from 'path';
import * as webpack from 'webpack';
import { expect } from 'chai';
import { Mock, createMockInstance } from '../../helpers/producers';
import OutputSorterPlugin, { Chunk } from '../../../src/compiler/OutputSorterPlugin';

describe('OutputSorterPlugin', () => {

  let compiler: Mock<webpack.Compiler>;
  let sut: OutputSorterPlugin;

  beforeEach(() => {
    compiler = createMockInstance(webpack.Compiler);
    sut = new OutputSorterPlugin();
  });

  it('should add the plugin on "emit" when "apply" is called', () => {
    sut.apply(compiler as any);
    expect(compiler.plugin).calledWith('emit');
  });

  it('should sort chunks according to dependencies with pre-webpack 2 chunks', done => {
    sut.apply(compiler as any);
    compiler.plugin.callArgOn(1, sut, createCompilation(
      { id: '1', files: ['1.js', 'foo.js'], parents: ['2', 'notExists'] },
      { id: '2', files: ['2.js'], parents: ['3', '4'] },
      { id: '3', files: ['3.js'] },
      { id: '4', files: [path.resolve('4.js')], parents: ['3'] }
    ), (error: any) => {
      expect(error).undefined;
      expect(sut.sortedFileNames).deep.eq(['3.js', path.resolve('4.js'), '2.js', '1.js', 'foo.js']);
      done();
    });
  });

  it('should sort chunks according to dependencies with post-webpack 2 chunks', done => {
    sut.apply(compiler as any);
    const chunk3: Chunk = { id: '3', files: ['3.js'] };
    const chunk4: Chunk = { id: '4', files: ['4.js'], parents: [chunk3] };
    const chunk2: Chunk = { id: '2', files: ['2.js'], parents: [chunk3, chunk4] };
    const chunk1: Chunk = { id: '1', files: ['1.js', 'foo.js'], parents: [chunk2] };
    compiler.plugin.callArgOn(1, sut, createCompilation(
      chunk1,
      chunk2,
      chunk3,
      chunk4
    ), (error: any) => {
      expect(error).undefined;
      expect(sut.sortedFileNames).deep.eq(['3.js', '4.js', '2.js', '1.js', 'foo.js']);
      done();
    });
  });

  function createCompilation(...chunks: Chunk[]) {
    return {
      getStats() {
        return {
          toJson() {
            return { chunks };
          }
        };
      }
    };
  }
});