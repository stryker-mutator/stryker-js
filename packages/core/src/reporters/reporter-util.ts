import path from 'path';
import { promisify } from 'util';
import { createReadStream, createWriteStream, promises as fs } from 'fs';

import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export function copyFile(fromFilename: string, toFilename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const readStream = createReadStream(fromFilename);
    const writeStream = createWriteStream(toFilename);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    readStream.pipe(writeStream);
    readStream.on('end', resolve);
  });
}

export const deleteDir = promisify(rimraf);
export const mkdir = mkdirp;

export async function writeFile(fileName: string, content: string): Promise<void> {
  await mkdirp(path.dirname(fileName));
  await fs.writeFile(fileName, content, 'utf8');
}
