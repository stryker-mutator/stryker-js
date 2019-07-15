import { fsAsPromised } from '@stryker-mutator/util';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { promisify } from 'util';
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

export const DELETE_DIR = promisify(rimraf);

export const MK_DIR = promisify(mkdirp);

export async function writeFile(fileName: string, content: string) {
  await MK_DIR(path.dirname(fileName));
  await fsAsPromised.writeFile(fileName, content, 'utf8');
}
