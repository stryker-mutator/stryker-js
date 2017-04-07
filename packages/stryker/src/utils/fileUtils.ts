import * as path from 'path';
import * as fs from 'graceful-fs';
import * as _ from 'lodash';
import * as nodeGlob from 'glob';
import * as mkdirp from 'mkdirp';

/**
 * Checks if a file or folder exists.
 * @function
 * @param path - The path to the file or folder.
 * @returns True if the file exists.
 */
export function fileOrFolderExistsSync(path: string): boolean {
  try {
    fs.lstatSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

export function fileOrFolderExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.lstat(path, (error, stats) => {
      resolve(!error);
    });
  });
}


/**
 * Reads a file.
 * @function
 * @param filename - The name of the file.
 * @returns The content of the file.
 */
export function readFile(filename: string) {
  return fs.readFileSync(filename, 'utf8');
}

/**
   * Normalizes the paths of a list of filenames.
   * @param files - The list of filenames which have to be normalized.
   */
export function normalize(files: string[]): void {
  _.forEach(files, function (file, key) {
    files[key] = path.resolve(path.normalize(file));
  });
}

export function glob(expression: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {

    nodeGlob(expression, { nodir: true }, (error, matches) => {
      if (error) {
        reject(error);
      } else {
        resolve(matches);
      }
    });

  });
}

export function readdir(path: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

function stats(path: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });
}


function rmFile(path: string) {
  return new Promise<void>((fileResolve, fileReject) => {
    fs.unlink(path, error => {
      if (error) {
        fileReject(error);
      } else {
        fileResolve();
      }
    });
  });
}

function rmdir(dirToDelete: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.rmdir(dirToDelete, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Deletes a directory recursively
 */
export async function deleteDir(dirToDelete: string): Promise<void> {
  let exists = await fileOrFolderExists(dirToDelete);
  if (exists) {
    let files = await readdir(dirToDelete);
    let promisses = files.map(async (file) => {
      let currentPath = path.join(dirToDelete, file);
      let sts = await stats(currentPath);
        if (sts.isDirectory()) {
          // recursive
          return deleteDir(currentPath);
        } else {
          // delete file
          return rmFile(currentPath);
        }
    });
    // delete dir
    await Promise.all(promisses);
    return rmdir(dirToDelete);
  }
}

export async function cleanFolder(folderName: string) {
  let exists = await fileOrFolderExists(folderName);
  if (exists) {
    await deleteDir(folderName);
    return mkdirRecursive(folderName);
  } else {
    return mkdirRecursive(folderName);
  }
}

export function writeFile(fileName: string, content: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(fileName, content, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function mkdirRecursive(folderName: string) {
  if (!fileOrFolderExistsSync(folderName)) {
    mkdirp.sync(folderName);
  }
}


/**
 * Wrapper around the 'require' function (for testability)
 */
export function importModule(moduleName: string) {
  require(moduleName);
}

export function isOnlineFile(path: string): boolean {
  return path.indexOf('http://') === 0 || path.indexOf('https://') === 0;
}