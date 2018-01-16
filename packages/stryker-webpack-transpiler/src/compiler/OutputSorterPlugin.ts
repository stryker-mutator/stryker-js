import * as webpack from 'webpack';
import * as _ from 'lodash';
const toposort = require('toposort');

export interface Chunk {
  id: string;
  files: string[];
  parents?: Array<string | Chunk>;
}

/**
 * A plugin that can sort the webpack files given there dependencies
 * so that they can be loaded in the browser in the correct order.
 * 
 * Given this dependency graph
 *       A   D
 *      / \ /
 *     B   C
 * 
 * The order might be:
 * D, A, B, C
 * 
 * @see https://www.npmjs.com/package/toposort#usage
 */
export default class OutputSorterPlugin implements webpack.Plugin {

  public sortedFileNames: string[];

  apply(compiler: webpack.Compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const allChunks: any[] = (compilation.getStats() as webpack.Stats).toJson().chunks;
      const sortedChunks = this.sort(allChunks);
      this.sortedFileNames = _.flatMap(sortedChunks, chunk => chunk.files);
      callback();
    });
  }

  private sort(allChunks: Chunk[]): Chunk[] {
    // We build a map (chunk-id -> chunk) for faster access during graph building.
    const chunkMap: { [chunkId: string]: Chunk } = {};
    allChunks.forEach((chunk) => {
      chunkMap[chunk.id] = chunk;
    });
    const edges: [Chunk, Chunk][] = [];

    allChunks.forEach(chunk => {
      if (chunk.parents) {
        // Add an edge for each parent (parent -> child)
        chunk.parents.forEach(parentId => {
          // webpack2 chunk.parents are chunks instead of string id(s)
          const parentChunk = typeof parentId === 'string' ? chunkMap[parentId] : parentId;
          // If the parent chunk does not exist (e.g. because of an excluded chunk)
          // we ignore that parent
          if (parentChunk) {
            edges.push([parentChunk, chunk]);
          }
        });
      }
    });

    // We now perform a topological sorting on the input chunks and built edges
    return toposort.array(allChunks, edges);
  }
}