import { fsAsPromised } from '@stryker-mutator/util';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

export function copyFile(fromFilename: string, toFilename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const readStream = fsAsPromised.createReadStream(fromFilename);
    const writeStream = fsAsPromised.createWriteStream(toFilename);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    readStream.pipe(writeStream);
    readStream.on('end', resolve);
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
