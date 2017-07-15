import * as fs from 'mz/fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

function copyFolderOrFile(fromPath: string, toPath: string): Promise<void> {
  return fs.stat(fromPath).then(stats => {
    if (stats.isDirectory()) {
      return copyFolder(fromPath, toPath);
    } else {
      return copyFile(fromPath, toPath);
    }
  });
}

export function copyFolder(fromPath: string, to: string): Promise<void> {
  return mkdir(to)
    .then(() => fs.readdir(fromPath))
    .then(files => Promise.all(files.map(file => copyFolderOrFile(path.join(fromPath, file), path.join(to, file)))))
    .then(_ => void 0);
}

export function copyFile(fromFilename: string, toFilename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let readStream = fs.createReadStream(fromFilename);
    let writeStream = fs.createWriteStream(toFilename);
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