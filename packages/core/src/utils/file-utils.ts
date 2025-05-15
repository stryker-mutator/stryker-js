import path from 'path';
import fs from 'fs';

import { isErrnoException } from '@stryker-mutator/util';

export const fileUtils = {
  /**
   * Cleans the dir by creating it.
   */
  async cleanDir(dirName: string): Promise<string | undefined> {
    try {
      await fs.promises.lstat(dirName);
      await fs.promises.rm(dirName, { recursive: true, force: true });
      return fs.promises.mkdir(dirName, { recursive: true });
    } catch {
      return fs.promises.mkdir(dirName, { recursive: true });
    }
  },

  async exists(fileName: string): Promise<boolean> {
    try {
      await fs.promises.access(fileName);
      return true;
    } catch (err) {
      if (isErrnoException(err) && err.code === 'ENOENT') {
        return false;
      } else {
        // Oops, didn't mean to catch this one ⚾
        throw err;
      }
    }
  },

  /**
   * Wrapper around the 'import' expression (for testability)
   */
  importModule(moduleName: string): Promise<unknown> {
    return import(moduleName);
  },

  /**
   * Recursively walks the from directory and copy the content to the target directory synchronously
   * @param from The source directory to move from
   * @param to The target directory to move to
   */
  moveDirectoryRecursiveSync(from: string, to: string): void {
    if (!fs.existsSync(from)) {
      return;
    }
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const files = fs.readdirSync(from);
    for (const file of files) {
      const fromFileName = path.join(from, file);
      const toFileName = path.join(to, file);
      const stats = fs.lstatSync(fromFileName);
      if (stats.isFile()) {
        fs.renameSync(fromFileName, toFileName);
      } else {
        this.moveDirectoryRecursiveSync(fromFileName, toFileName);
      }
    }
    fs.rmdirSync(from);
  },

  /**
   * Creates a symlink at `from` that points to `to`
   * @param to The thing you want to point to
   * @param from The thing you want to point from
   */
  async symlinkJunction(to: string, from: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(from), { recursive: true });
    return fs.promises.symlink(to, from, 'junction');
  },

  /**
   * Looks for the node_modules folder from basePath up to root.
   * returns the first occurrence of the node_modules, or null of none could be found.
   * @param basePath starting point
   */
  async findNodeModulesList(
    basePath: string,
    tempDirName?: string,
  ): Promise<string[]> {
    const nodeModulesList: string[] = [];
    const dirBfsQueue: string[] = ['.'];

    let dir: string | undefined;
    while ((dir = dirBfsQueue.pop())) {
      if (path.basename(dir) === tempDirName) {
        continue;
      }

      if (path.basename(dir) === 'node_modules') {
        nodeModulesList.push(dir);
        continue;
      }

      const parentDir = dir;
      const filesWithType = await fs.promises.readdir(
        path.join(basePath, dir),
        { withFileTypes: true },
      );
      const dirs = filesWithType
        .filter((file) => file.isDirectory())
        .map((childDir) => path.join(parentDir, childDir.name));
      dirBfsQueue.push(...dirs);
    }

    return nodeModulesList;
  },
};
