import { File } from '../../core';

/**
 * Represents a transpiler plugin.
 *
 * Transpilers can change the content of input files before testing.
 * To ensure the max performance all actions are done in-memory, no file IO.
 * Transpilers are implemented as a chain of transpilers,
 * the result of any previous compiler can be passed thru to the next
 *
 * Transpilers are stateful. They are expected to keep track of any state needed to perform mutations on existing files.
 * They are also expected to keep track of any source-maps if `keepSourceMaps` is set to true, in order to implement `getMappedLocation`
 */
export default interface Transpiler {
  /**
   * Transpile each file and return the result.
   * Should also return any untouched files in the result.
   *
   * Any consecutive calls to transpile will not include all files, instead only the changed files in relation to the previous call.
   * This makes any Transpiler stateful.
   *
   * @example An example of consecutive transpiler calls:
   *
   *      call 1: [foo.es6, bar.es6, fooSpec.es6, barSpec.es6, image.png]
   *      call 2: [foo.es6 (mutated)]
   *      call 3: [foo.es6 (mutated)]
   *      call 4: [foo.es6, bar.es6 (mutated)]
   *      call 5: [bar.es6 (mutated)]
   *
   * @returns an rejection (if transpiling failed) or the output files to be used as input for the next transpiler
   */
  transpile(files: readonly File[]): Promise<readonly File[]>;
}
