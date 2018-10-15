import { fsAsPromised } from '@stryker-mutator/util';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

async function copyFolderOrFile(fromPath: string, toPath: string): Promise<void> {
  const stats = await fsAsPromised.stat(fromPath);
  if (stats.isDirectory()) {
    return copyFolder(fromPath, toPath);
  }
  else {
    return copyFile(fromPath, toPath);
  }
}

export function copyFolder(fromPath: string, to: string): Promise<void> {
  return mkdir(to)
    .then(() => fsAsPromised.readdir(fromPath))
    .then(files => Promise.all(files.map(file => copyFolderOrFile(path.join(fromPath, file), path.join(to, file)))))
    .then(_ => void 0);
}

function copyFile(fromFilename: string, toFilename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const readStream = fsAsPromised.createReadStream(fromFilename);
    const writeStream = fsAsPromised.createWriteStream(toFilename);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    readStream.pipe(writeStream);
    readStream.on('end', () => resolve());
  });
}

export function deleteDir(dirToDelete: string): Promise<void> {
  return new Promise((res, rej) => {
    rimraf(dirToDelete, err => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

export function mkdir(folderName: string): Promise<void> {
  return new Promise<void>((res, rej) => {
    mkdirp(folderName, err => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

export function writeFile(fileName: string, content: string) {
  return mkdir(path.dirname(fileName))
    .then(_ => fsAsPromised.writeFile(fileName, content, 'utf8'));
}

export function countPathSep(fileName: string) {
  let count = 0;
  for (const ch of fileName) {
    if (ch === path.sep) {
      count++;
    }
  }
  return count;
}
