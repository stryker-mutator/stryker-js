import * as fs from 'fs';
import * as minimatch from 'minimatch';
import * as path from 'path';
import * as execa from 'execa';

const testRootDir = path.resolve(__dirname, '..', 'test');

installAll()
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

/**
 * Installs all packages under the "test" directory, while respecting their preferred package manager (yarn vs npm 🙄)
 */
async function installAll() {
  const globPattern = process.env.PERF_TEST_GLOB_PATTERN || '*';
  const testDirs = fs.readdirSync(testRootDir).filter(testDir => minimatch(testDir, globPattern));
  if (testDirs.length) {
    console.log(`Installing ${testDirs.join(', ')} (matched with glob pattern "${globPattern}")`)
  } else {
    console.warn(`No tests match glob expression ${globPattern}`);
  }
  await Promise.all(testDirs.map(install))
}

async function install(testDir: string) {
  const strykerConfig = require(`../test/${testDir}/stryker.conf`);
  const packageManager: string | undefined = strykerConfig.packageManager;
  if(packageManager === 'yarn') {
    await execa('yarn', ['install', '--frozenLockFile'], { cwd: path.resolve(testRootDir, testDir) });
  }else {
    await execa('npm', ['ci'], { cwd: path.resolve(testRootDir, testDir) });
  }
}
