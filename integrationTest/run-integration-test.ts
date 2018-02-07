import * as fs from 'fs';
import * as path from 'path';
import execa = require('execa');

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

function runTest(testDir: string) {
  return execNpm('i', testDir).then(() => {
    console.log(`\u2714 ${testDir} installed`);
    return execNpm('test', testDir).then(() => {
      console.log(`\u2714 ${testDir} tested (${++testsRan}/${dirs.length})`);
    });
  });
}

