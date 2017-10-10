import * as fs from 'mz/fs';
import * as path from 'path';
import * as nodeGlob from 'glob';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import { FileKind } from 'stryker-api/core';

export function glob(expression: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    nodeGlob(expression, { nodir: true }, (error, matches) => { error ? reject(error) : resolve(matches); });
  });
}

export function deleteDir(dirToDelete: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(dirToDelete, error => { error ? reject(error) : resolve(); });
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
export function importModule(moduleName: string) {
  require(moduleName);
}

export function isOnlineFile(path: string): boolean {
  return path.indexOf('http://') === 0 || path.indexOf('https://') === 0;
}

const binaryExtensions = [
  '.png',
  '.jpeg',
  '.gif' // Still more to add
];

function isBinaryFile(name: string): boolean {
  return binaryExtensions.indexOf(path.extname(name)) > -1;
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

export function determineFileKind(fileName: string): FileKind {
  if (isOnlineFile(fileName)) {
    return FileKind.Web;
  } if (isBinaryFile(fileName)) {
    return FileKind.Binary;
  } else {
    return FileKind.Text;
  }
}