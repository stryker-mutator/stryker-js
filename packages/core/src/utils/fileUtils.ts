import path from 'path';
import { promises as fs } from 'fs';

import nodeGlob from 'glob';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export function glob(expression: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    nodeGlob(expression, { nodir: true }, (error, matches) => {
      error ? reject(error) : resolve(matches);
    });
  });
}

export function deleteDir(dirToDelete: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(dirToDelete, (error) => {
      error ? reject(error) : resolve();
    });
  });
}

export async function cleanFolder(folderName: string) {
  try {
    await fs.lstat(folderName);
    await deleteDir(folderName);
    return mkdirp.sync(folderName);
  } catch (e) {
    return mkdirp.sync(folderName);
  }
}

/**
 * Wrapper around the 'require' function (for testability)
 */
export function importModule(moduleName: string): unknown {
  return require(moduleName);
}

/**
 * Writes data to a specified file.
 * @param fileName The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
export function writeFile(fileName: string, data: string | Buffer): Promise<void> {
  if (Buffer.isBuffer(data)) {
    return fs.writeFile(fileName, data);
  } else {
    return fs.writeFile(fileName, data, 'utf8');
  }
}

/**
 * Creates a symlink at `from` that points to `to`
 * @param to The thing you want to point to
 * @param from The thing you want to point from
 */
export function symlinkJunction(to: string, from: string) {
  return fs.symlink(to, from, 'junction');
}

/**
 * Looks for the node_modules folder from basePath up to root.
 * returns the first occurrence of the node_modules, or null of none could be found.
 * @param basePath starting point
 */
export async function findNodeModules(basePath: string): Promise<string | null> {
  basePath = path.resolve(basePath);
  const nodeModules = path.resolve(basePath, 'node_modules');
  try {
    await fs.stat(nodeModules);
    return nodeModules;
  } catch (e) {
    const parent = path.dirname(basePath);
    if (parent === basePath) {
      return null;
    } else {
      return findNodeModules(path.dirname(basePath));
    }
  }
}
