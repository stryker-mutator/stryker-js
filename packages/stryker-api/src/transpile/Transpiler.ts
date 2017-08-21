import FileLocation from './FileLocation';
import TranspileFile from './TranspileFile';
import TranspileResult from './TranspileResult';

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
   * @returns a Promise that resolves in an error message (if transpiling failed) or the result of the next transpiler
   */
  transpile(files: TranspileFile[]): Promise<TranspileResult>;

  /**
   * Transpile a (temporary) mutant in one file.
   * Should return only the output file that is changed.
   * It is important that the transpiled file is reset before the next time `mutate` is called with a different file,
   * mutated state should never linger.
   */
  mutate(file: TranspileFile): Promise<TranspileResult>;

  /**
   * Retrieve the location of a source location in the transpiled file. 
   */
  getMappedLocation(sourceFileLocation: FileLocation): FileLocation;
}