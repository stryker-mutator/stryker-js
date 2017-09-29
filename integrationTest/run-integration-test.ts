import * as fs from 'fs';
import * as path from 'path';
import execa = require('execa');

describe('integration-tests', function () {

  this.timeout(500000);

  before(() => {
    console.log('  Exec npm install...');
    return execa('npm', ['install'], { cwd: __dirname });
  });

  const testRootDir = path.resolve(__dirname, 'test');
  const dirs = fs.readdirSync(testRootDir)
    .filter(file => fs.statSync(path.join(testRootDir, file)).isDirectory());
  dirs.forEach(testDir => {
    describe(testDir, () => {
      it('should run test', () => {
        const currentTestDir = path.resolve(testRootDir, testDir);
        console.log(`    Exec ${testDir} npm test`);
        execa.sync('npm', ['test'], { cwd: currentTestDir, stdio: [0, 1, 2] });
      });
    });
  });
});
