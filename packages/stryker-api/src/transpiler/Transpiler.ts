import FileStream from './FileStream';
import FileLocation from './FileLocation';

/**
 * Represents a transpiler plugin.
 * 
 * Transpilers can change the content of input files before testing.
 * To ensure the max performance all actions are done in-memory, no file IO.
 * Transpilers are implemented as a [decorator pattern](https://en.wikipedia.org/wiki/Decorator_pattern)
 * Each transpiler has the responsibility of delivering the changed or unchanged files to the next decorator.
 */
export default interface Transpiler {
  
  /**
   * Transpile each file and call `transpile` on the next decorator with the result.
   * Should forward all not-transpiled files (html files, images, etc) to the next decorator.
   * 
   * @returns a Promise that resolves in an error message (if transpiling failed) or the result of the next transpiler
   */
  transpile(files: FileStream[]): Promise<string | null>;

  mutate(file: FileStream): Promise<string | null>;

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation;
}