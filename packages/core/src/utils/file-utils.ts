import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import nodeGlob from 'glob';
import mkdirpModule from 'mkdirp';
import rimraf from 'rimraf';

export const MAX_CONCURRENT_FILE_IO = 256;

export const mkdirp = mkdirpModule;

export function glob(expression: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    nodeGlob(expression, { nodir: true }, (error, matches) => {
      error ? reject(error) : resolve(matches);
    });
  });
}

export const deleteDir = promisify(rimraf);

export async function cleanFolder(folderName: string): Promise<string | undefined> {
  try {
    await fs.promises.lstat(folderName);
    await deleteDir(folderName);
    return mkdirp(folderName);
  } catch (e) {
    return mkdirp(folderName);
  }
}

/**
 * Wrapper around the 'require' function (for testability)
 */
export function importModule(moduleName: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(moduleName);
}

/**
 * Recursively walks the from directory and copy the content to the target directory synchronously
 * @param from The source directory to move from
 * @param to The target directory to move to
 */
export function moveDirectoryRecursiveSync(from: string, to: string): void {
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
      moveDirectoryRecursiveSync(fromFileName, toFileName);
    }
  }
  fs.rmdirSync(from);
}

/**
 * Creates a symlink at `from` that points to `to`
 * @param to The thing you want to point to
 * @param from The thing you want to point from
 */
export function symlinkJunction(to: string, from: string): Promise<void> {
  return fs.promises.symlink(to, from, 'junction');
}

/**
 * Looks for the node_modules folder from basePath up to root.
 * returns the first occurrence of the node_modules, or null of none could be found.
 * @param basePath starting point
 */
export async function findNodeModulesList(basePath: string, tempDirName?: string): Promise<string[]> {
  const nodeModulesList: string[] = [];
  const dirBfsQueue: string[] = ['.'] ?? [];

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
    const filesWithType = await fs.promises.readdir(path.join(basePath, dir), { withFileTypes: true });
    const dirs = filesWithType.filter((file) => file.isDirectory()).map((childDir) => path.join(parentDir, childDir.name));
    dirBfsQueue.push(...dirs);
  }

  return nodeModulesList;
}
