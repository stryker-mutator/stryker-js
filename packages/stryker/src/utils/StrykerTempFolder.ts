import * as fs from 'mz/fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as log4js from 'log4js';
import { deleteDir } from './fileUtils';

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
 * @param fileName The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
function writeFile(fileName: string, data: string | Buffer, instrumenter: NodeJS.ReadWriteStream | null = null): Promise<void> {
  if (Buffer.isBuffer(data)) {
    return fs.writeFile(fileName, data);
  } else if (instrumenter) {
    instrumenter.pipe(fs.createWriteStream(fileName, 'utf8'));
    return writeToStream(data, instrumenter);
  } else {
    return fs.writeFile(fileName, data, 'utf8');
  }
}

function writeToStream(data: string | Buffer, stream: NodeJS.WritableStream): Promise<void> {
  return new Promise((res, rej) => {
    stream.end(data as string, (err: any) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
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
  clean
};
