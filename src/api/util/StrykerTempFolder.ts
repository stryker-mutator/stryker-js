import * as os from 'os'
import * as fs from 'fs';
import * as path from 'path';

let baseTempFolder = os.tmpdir() + path.sep + 'stryker';
let tempFolder = baseTempFolder + path.sep + random();
ensureFolderExists(baseTempFolder);
ensureFolderExists(tempFolder);

function createRandomFolder(prefix: string) {
  return ensureFolderExists(tempFolder + path.sep + prefix + random());
}

function random() {
  Math.ceil(Math.random() * 10000000)
}

function ensureFolderExists(path: string) {
  if (!fileOrFolderExists(path)) {
    fs.mkdirSync(path);
  }
  return path;
}

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
   * Checks if a file or folder exists.
   * @function
   * @param path - The path to the file or folder.
   * @returns True if the file exists.
   */
function fileOrFolderExists(path: string): boolean {
  try {
    var stats = fs.lstatSync(path);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  createRandomFolder,
  writeFile
};
