import * as os from 'os';
import * as fs from 'graceful-fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as fileUtils from './fileUtils';
import * as log4js from 'log4js';

const log = log4js.getLogger('fileUtils');

let baseTempFolder = path.join(process.cwd(), '.stryker-tmp');
let tempFolder = path.join(baseTempFolder, random().toString());
ensureFolderExists(baseTempFolder);
ensureFolderExists(tempFolder);

/**
 * Creates a new random folder with the specified prefix.
 * @param prefix The prefix.
 * @returns The path to the folder.
 */
function createRandomFolder(prefix: string): string {
  return ensureFolderExists(tempFolder + path.sep + prefix + random());
}

/**
 * Creates a random integer number.
 * @returns A random integer.
 */
function random(): number {
  return Math.ceil(Math.random() * 10000000);
}

/**
 * Creates a folder at the specified path if it doesn't already exist.
 * @param path The path to check.
 * @returns The path of the folder.
 */
function ensureFolderExists(path: string): string {
  if (!fileOrFolderExists(path)) {
    mkdirp.sync(path);
  }
  return path;
}

/**
 * Checks if a file or folder exists.
 * @param path The path to the file or folder.
 * @returns True if the file exists.
 */
function fileOrFolderExists(path: string): boolean {
  try {
    fs.lstatSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Writes data to a specified file.
 * @param filename The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
function writeFile(filename: string, data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filename, data, { encoding: 'utf8' }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Copies a file.
 * @param fromFilename The path to the existing file.
 * @param toFilename The path to copy the file to.
 * @param instrumenter An optional additional instrumenter to stream the file through
 * @returns A promise to eventually copy the file.
 */
function copyFile(fromFilename: string, toFilename: string, instrumenter: NodeJS.ReadWriteStream | null): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let readStream: NodeJS.ReadableStream = fs.createReadStream(fromFilename, { encoding: 'utf8' });
    let writeStream = fs.createWriteStream(toFilename, { encoding: 'utf8' });
    readStream.on('error', reject);
    writeStream.on('error', reject);
    if (instrumenter) {
      readStream = readStream.pipe(instrumenter);
    }
    readStream.pipe(writeStream);
    readStream.on('end', () => resolve());
  });
}

/**
 * Deletes the Stryker-temp folder
 */
function clean() {
  log.debug(`Cleaning stryker temp folder ${baseTempFolder}`);
  return fileUtils.deleteDir(baseTempFolder);
}

export default {
  createRandomFolder,
  writeFile,
  copyFile,
  ensureFolderExists,
  clean
};
