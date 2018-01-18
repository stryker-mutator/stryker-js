import * as fs from 'fs';
import * as path from 'path';
import execa = require('execa');
import semver = require('semver');

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
    const pkg = JSON.parse(fs.readFileSync(path.resolve(testRootDir, testDir, 'package.json'), 'utf8'));
    if (!pkg.engine || !pkg.engines.node || semver.gte(process.version, pkg.engines.node)) {
      describeTestDir(testDir);
    } else {
      console.log(`Skipping ${testDir} as it is not supported for node version ${process.version}.`);
    }
  });

  function describeTestDir(testDir: string) {
    const currentTestDir = path.resolve(testRootDir, testDir);
    describe(testDir, () => {
      before(() => {
        console.log(`    Exec ${testDir} npm i`);
        execa.sync('npm', ['i'], { cwd: currentTestDir });
      });

      it('should run test', () => {
        console.log(`    Exec ${testDir} npm test`);
        const testProcess = execa('npm', ['test'], { cwd: currentTestDir, stdio: 'pipe' });
        let stderr = '';
        let stdout = '';
        testProcess.stderr.on('data', chunk => stderr += chunk.toString());
        testProcess.stdout.on('data', chunk => stdout += chunk.toString());
        return testProcess.catch(error => {
          console.log(stdout);
          console.error(stderr);
          throw error;
        });
      });
    });
  }
});
