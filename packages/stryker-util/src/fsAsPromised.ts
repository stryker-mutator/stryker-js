import * as fs from 'fs';
import promisify from './promisify';

/**
 * This file contains an implementation of fs.promises
 * Note: Can be removed once we drop support for node 8 (and 9).
 */

export default {
  access: promisify(fs.access),
  constants: fs.constants,
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  // Don't promisify exists! It is deprecated and doesn't work on node6 (no error in callback function)
  existsSync: fs.existsSync,
  lstat: promisify(fs.lstat),
  readdir: promisify(fs.readdir),
  readdirSync: fs.readdirSync,
  readFile: promisify(fs.readFile),
  stat: promisify(fs.stat),
  symlink: promisify(fs.symlink),
  writeFile: promisify(fs.writeFile),
};
