import execa = require('execa');
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

const testRootDir = path.resolve(__dirname, 'test');
let testsRan = 0;
const dirs = fs.readdirSync(testRootDir)
  .filter(file => fs.statSync(path.join(testRootDir, file)).isDirectory());
Promise.all(dirs.map(runTest)).catch(() => {
  process.exit(1);
});

function execNpm(command: string, testDir: string) {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
  let stderr = '';
  let stdout = '';
  testProcess.stderr.on('data', chunk => stderr += chunk.toString());
  testProcess.stdout.on('data', chunk => stdout += chunk.toString());

  return testProcess.catch(error => {
    console.log(`X ${testDir}`);
    console.log(stdout);
    console.error(stderr);
    throw error;
  });
}

function satisfiesNodeVersion(testDir: string): boolean {
  const pkg = require(path.resolve(testRootDir, testDir, 'package.json'));
  const supportedNodeVersionRange = pkg.engines && pkg.engines.node;
  if (supportedNodeVersionRange && !semver.satisfies(process.version, supportedNodeVersionRange)) {
    console.log(`\u2610 ${testDir} skipped (node version ${process.version} did not satisfy ${supportedNodeVersionRange})`);

    return false;
  }

  return true;
}

async function runTest(testDir: string) {
  if (satisfiesNodeVersion(testDir)) {
    try {
      await execNpm('i', testDir);
    } catch (error) {
      console.log(`Failed to install in ${testDir}, trying once more`);
      await execNpm('i', testDir);
    }
    console.log(`\u2714 ${testDir} installed`);
    await execNpm('test', testDir);
    console.log(`\u2714 ${testDir} tested (${++testsRan}/${dirs.length})`);
  }
}
