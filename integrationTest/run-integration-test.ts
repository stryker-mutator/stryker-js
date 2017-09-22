import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('integration-tests', function () {

  this.timeout(500000);

  before(() => {
    execSync('npm install', { cwd: __dirname, stdio: [0, 1, 2]  });
  });

  const testRootDir = path.resolve(__dirname, 'test');
  const dirs = fs.readdirSync(testRootDir)
    .filter(file => fs.statSync(path.join(testRootDir, file)).isDirectory());
  dirs.forEach(testDir => {
    describe(testDir, () => {
      it('should run test', () => {
        const currentTestDir = path.resolve(testRootDir, testDir);
        console.log(`Exec in ${testDir}: $npm test`);
        execSync('npm test', { cwd: currentTestDir , maxBuffer: Infinity });
      });
    });
  });
});
