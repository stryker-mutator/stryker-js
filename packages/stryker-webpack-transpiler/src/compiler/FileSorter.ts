import * as path from 'path';
import * as _ from 'lodash';
import { File } from 'stryker-api/core';
const toposort = require('toposort');

export interface Chunk {
  id: string;
  files: string[];
  parents?: Array<string | Chunk>;
}

/**
 * Responsible for sorting files given their webpack dependencies
 * so they can be loaded in the browser in the correct order.
 * 
 * Given this dependency graph
 *       A   D
 *      / \ /
 *     B   C
 * 
 * The output order might be:
 * D, A, B, C
 * 
 * Note: This implementation is copied over from toposort
 * 
 * @see https://www.npmjs.com/package/toposort#usage
 */
export default class FileSorter {

  static sort(files: File[], allChunks: Chunk[]): File[] {
    const sortedChunks = this.sortChunks(allChunks);
    const sortedFileNames = _.flatMap(sortedChunks, chunk => chunk.files.map(file => path.basename(file)));
    files.sort((a, b) => {
      const aName = path.basename(a.name);
      const bName = path.basename(b.name);
      return sortedFileNames.indexOf(aName) - sortedFileNames.indexOf(bName);
    });
    return files;
  }

  private static sortChunks(allChunks: Chunk[]): Chunk[] {
    // We build a map (chunk-id -> chunk) for faster access during graph building.
    const chunkMap: { [chunkId: string]: Chunk } = {};
    allChunks.forEach((chunk) => {
      chunkMap[chunk.id] = chunk;
    });

    // Build the *edges* of the graph. 
    // It will contain an entry per parent -> child relationship
    const edges: [Chunk, Chunk][] = [];

    allChunks.forEach(chunk => {
      if (chunk.parents) {
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