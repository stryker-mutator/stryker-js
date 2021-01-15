import path = require('path');

import { notEmpty } from './not-empty';

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
  private parents: Set<string>;

  /**
   * Records the files required in the current working directory (excluding node_modules)
   * Only does so the first time, any subsequent calls will be ignored
   */
  public record() {
    if (!this.cache) {
      const cwd = process.cwd();
      this.cache = new Set();
      Object.keys(require.cache)
        .filter((fileName) => fileName.startsWith(`${cwd}${path.sep}`) && !fileName.startsWith(path.join(cwd, 'node_modules')))
        .forEach((file) => this.cache.add(file));

      this.parents = new Set(
        Array.from(this.cache)
          // `module.parent` is deprecated, but seems to work fine, might never be removed.
          // See https://nodejs.org/api/modules.html#modules_module_parent
          .map((fileName) => require.cache[fileName]?.parent?.filename)
          .filter(notEmpty)
          // Filter out any parents that are in the current cache, since they will be removed anyway
          .filter((parentFileName) => !this.cache.has(parentFileName))
      );
    }
  }

  public clear() {
    if (this.cache && this.parents) {
      this.parents.forEach((parent) => {
        const parentModule = require.cache[parent];
        if (parentModule) {
          parentModule.children = parentModule.children.filter((childModule) => !this.cache.has(childModule.id));
        }
      });
      this.cache.forEach((fileName) => delete require.cache[fileName]);
    }
  }
}
