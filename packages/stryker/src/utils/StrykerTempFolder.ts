import * as fs from 'mz/fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as log4js from 'log4js';
import { deleteDir} from './fileUtils';

const log = log4js.getLogger('StrykerTempFolder');

let baseTempFolder = path.join(process.cwd(), '.stryker-tmp');
let tempFolder = path.join(baseTempFolder, random().toString());
mkdirp.sync(baseTempFolder);
mkdirp.sync(tempFolder);

/**
 * Creates a new random folder with the specified prefix.
 * @param prefix The prefix.
 * @returns The path to the folder.
 */
function createRandomFolder(prefix: string): string {
  let dir = tempFolder + path.sep + prefix + random();
  mkdirp.sync(dir);
  return dir;
}

/**
 * Creates a random integer number.
 * @returns A random integer.
 */
function random(): number {
  return Math.ceil(Math.random() * 10000000);
}

/**
 * Writes data to a specified file.
 * @param filename The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
function writeFile(filename: string, data: string): Promise<void> {
  return fs.writeFile(filename, data, { encoding: 'utf8' });
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
    let writeStream = fs.createWriteStream(toFilename);
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
  return deleteDir(baseTempFolder)
    .catch(() => log.info(`Failed to clean stryker temp folder ${baseTempFolder}`));
}

export default {
  createRandomFolder,
  writeFile,
  copyFile,
  clean
};
