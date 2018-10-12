import * as fs from 'fs';
import promisify from './promisify';

/**
 * This file contains an implementation of fs.promises
 * Note: Can be removed once we drop support for node 8 (and 9).
 */

export default {
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  exists: promisify(fs.exists),
  existsSync: fs.existsSync,
  lstat: promisify(fs.lstat),
  readdir: promisify(fs.readdir),
  readdirSync: fs.readdirSync,
  readFile: promisify(fs.readFile),
  stat: promisify(fs.stat),
  symlink: promisify(fs.symlink),
  writeFile: promisify(fs.writeFile),
};
