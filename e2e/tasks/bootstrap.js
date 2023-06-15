import fs from 'fs/promises';
import os from 'os';

import { fileURLToPath } from 'url';

import { execa } from 'execa';
import { from, mergeMap } from 'rxjs';

import { filter } from 'minimatch';
/**
 * Installs all test packages using max cpu as concurrent.
 */

const pattern = process.argv[2] || '*';
const dirs = (await fs.readdir(new URL('../test', import.meta.url))).filter(filter(pattern));
const concurrency = os.cpus().length;
const command = process.env.CI ? 'ci' : 'install';

console.info(`Installing ${dirs.length} test dirs using "npm ${command}" (used pattern: "${pattern}", concurrency ${concurrency})`);
let count = 0;
reportProgress();
from(dirs)
  .pipe(
    mergeMap(async (dir) => {
      const cwd = fileURLToPath(new URL(`../test/${dir}`, import.meta.url));
      try {
        await execa('npm', [command], { timeout: 500000, cwd, stdio: 'pipe' });
        return dir;
      } catch (err) {
        throw new Error(`Error running "npm ${command}" in ${cwd}`, { cause: err });
      }
    }, concurrency)
  )
  .subscribe({
    next: (dir) => {
      count++;
      reportProgress(dir);
    },
    error: (err) => {
      console.error(err);
      process.exitCode = 1;
    },
  });

/*** @param {string} [current] */
function reportProgress(current) {
  // if still successful
  if (!process.exitCode) {
    if (count > 0) {
      process.stdout.write('\r');
    }
    process.stdout.write(`${count}/60${current ? ` (${current})` : ''}`);
    process.stdout.clearLine?.(1);
  }
}
