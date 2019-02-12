import { exec } from 'child_process';
import { exists } from 'fs';
import * as util from 'util';

/**
 * This file contains an implementation of util.promisify (available on node >= 8)
 * Note: Can be removed once we drop support for node 6 (and 7).
 */
function promisify(original: any) {
  if ('promisify' in util) {
    return util.promisify(original); // let nodejs do it's thing thing, if it is supported
  } else {
    return innerPromisify(original); // Do it ourselves
  }
}

// This function is exported so that it can be tested on node >= 8
export function innerPromisify(original: any) {
  return function fn(this: unknown, ...args: any[]) {
    return new Promise((resolve, reject) => {
      original.call(this, ...args, (err: Error, ...values: any[]) => {
        if (original === exists) {
          // the exists callback is NOT consistent with NodeJS callbacks: https://nodejs.org/api/fs.html#fs_fs_exists_path_callback
          // First argument is the result instead of an error
          resolve(err);
        } else if (err) {
          reject(err);
        } else {
          // Make an exception for child_process.exec, this is also done by node 8+'s implementation
          // https://github.com/nodejs/node/blob/2ec57a71343cdb725d45801508fceb0a266a9324/lib/internal/util.js#L272
          if (original === exec) {
            resolve({
              stderr: values[1],
              stdout: values[0]
            });
          } else {
            resolve(values[0]);
          }
        }
      });
    });
  };
}

export default promisify as typeof util.promisify;
