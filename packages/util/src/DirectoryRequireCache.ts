import path = require('path');

/**
 * A helper class that can be used by test runners.
 * The first time you call `record`, it will fill the internal registry with the files required in the current working directory (excluding node_modules)
 * Then each time you call `clear` it will clear those files from the require cache
 */
export class DirectoryRequireCache {
  private cache: Set<string>;
  private initFiles?: readonly string[];

  public init(initFiles: readonly string[]) {
    this.initFiles = initFiles;
  }

  /**
   * Records the files required in the current working directory (excluding node_modules)
   * Only does so the first time, any subsequent calls will be ignored
   */
  public record() {
    if (!this.cache) {
      const cwd = process.cwd();
      this.cache = new Set(this.initFiles);
      Object.keys(require.cache)
        .filter((fileName) => fileName.startsWith(`${cwd}${path.sep}`) && !fileName.startsWith(path.join(cwd, 'node_modules')))
        .forEach((file) => this.cache.add(file));
    }
  }

  public clear() {
    if (this.cache) {
      this.cache.forEach((fileName) => delete require.cache[fileName]);
    }
  }
}
