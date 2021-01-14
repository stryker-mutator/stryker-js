import path = require('path');

/**
 * A helper class that can be used by test runners.
 * The first time you call `record`, it will fill the internal registry with the files required in the current working directory (excluding node_modules)
 * Then each time you call `clear` it will clear those files from the require cache
 *
 * It will also delete the `module.children` property of the root module.
 * @see https://github.com/stryker-mutator/stryker/issues/2461
 */
export class DirectoryRequireCache {
  private cache: Set<string>;
  private initFiles?: readonly string[];
  private parents: Set<string>;

  public init({ initFiles }: { initFiles: readonly string[] }) {
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
      this.parents = new Set();
      Object.entries(require.cache)
        .filter(([fileName]) => fileName.startsWith(`${cwd}${path.sep}`) && !fileName.startsWith(path.join(cwd, 'node_modules')))
        .forEach(([file, module]) => {
          this.cache.add(file);
          // TODO parent is deprecated
          // See https://nodejs.org/api/modules.html#modules_module_parent
          const parentFile = module?.parent?.filename;
          if (parentFile) {
            this.parents.add(parentFile);
          }
        });
    }
  }

  public clear() {
    if (this.cache && this.parents) {
      this.parents.forEach((parent) => {
        const parentModule = require.cache[parent];
        if (parentModule) {
          parentModule.children = parentModule.children.filter((childModule) => !this.cache.has(childModule.id));
        } else {
          throw new Error(`Could not find "${parent}" in require cache.`);
        }
      });
      this.cache.forEach((fileName) => delete require.cache[fileName]);
    }
  }
}
