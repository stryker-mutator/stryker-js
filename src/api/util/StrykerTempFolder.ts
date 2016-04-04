import * as os from 'os'
import * as fs from 'fs';
import * as path from 'path';

let baseTempFolder = os.tmpdir() + path.sep + 'stryker';
let tempFolder = baseTempFolder + path.sep + random();
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
    fs.mkdirSync(path);
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
    var stats = fs.lstatSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Writes data to a specified file.
 * @param fileName The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
function writeFile(fileName: string, data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(fileName, data, { encoding: 'utf8' }, (error) => {
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
 * @param fromFileName The path to the existing file.
 * @param toFileName The path to copy the file to.
 * @returns A promise to eventually copy the file.
 */
function copyFile(fromFileName: string, toFileName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let readStream = fs.createReadStream(fromFileName, { encoding: 'utf8' });
    let writeStream = fs.createWriteStream(toFileName, { encoding: 'utf8' });
    readStream.on('error', reject);
    writeStream.on('error', reject);
    readStream.pipe(writeStream);
    readStream.on('end', () => resolve());
  });
}

export default {
  createRandomFolder,
  writeFile,
  copyFile
};
