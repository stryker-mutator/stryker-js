import fs from 'fs';
import { fileURLToPath, URL } from 'url';
import minimatch from 'minimatch';
import { execa } from 'execa';

const testRootDirUrl = new URL('../test', import.meta.url);

installAll()
  .then(() => console.log('Done'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

/**
 * Installs all packages under the "test" directory, while respecting their preferred package manager (yarn vs npm 🙄)
 */
async function installAll() {
  const globPattern = process.env.PERF_TEST_GLOB_PATTERN || '*';
  const testDirs = fs.readdirSync(testRootDirUrl).filter((testDir) => minimatch(testDir, globPattern));
  if (testDirs.length) {
    console.log(`Installing ${testDirs.join(', ')} (matched with glob pattern "${globPattern}")`);
  } else {
    console.warn(`No tests match glob expression ${globPattern}`);
  }
  await Promise.all(testDirs.map(install));
}

/**
 * @param {string} testDir
 */
async function install(testDir) {
  const testDirUrl = new URL(testDir, `${testRootDirUrl}/`);
  const strykerConfig = JSON.parse(await fs.promises.readFile(new URL(`../test/${testDir}/stryker.conf.json`, import.meta.url), 'utf-8'));
  /** @type {string | undefined} */
  const packageManager = strykerConfig.packageManager;
  let command = 'npm';
  /** @type {string[]} */
  let args = [];
  if (packageManager === 'yarn') {
    command = 'yarn';
    args.push('install', '--frozen-lockfile');
  } else if (fs.existsSync(new URL('package-lock.json', `${testDirUrl}/`))) {
    args.push('ci');
  } else {
    args.push('install');
  }
  console.log(`[${testDir}] ${command} ${args.join(' ')}`);
  await execa(command, args, { cwd: fileURLToPath(testDirUrl) });
}
