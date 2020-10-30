import * as path from 'path';
import { promisify } from 'util';
import { promises as fs } from 'fs';

import mkdirp = require('mkdirp');
import * as rimraf from 'rimraf';
import { throwError } from 'rxjs';

export const deleteDir = promisify(rimraf);
export const mkdir = mkdirp;

export async function writeFile(fileName: string, content: string) {
  try {
    await mkdirp(path.dirname(fileName));
    await fs.writeFile(fileName, content, 'utf8');
  } catch (error) {
    throwError(error);
  }
}
