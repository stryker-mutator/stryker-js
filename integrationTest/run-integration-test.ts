import * as fs from 'fs';
import * as path from 'path';
import Executor from './Executor';

describe('integration-tests', function () {

  this.timeout(500000);

  before(done => {
    new Executor('.').exec('npm install', {}, done);
  });

  const root = path.join('integrationTest', 'test');
  const dirs = fs.readdirSync(root)
    .filter(f => fs.statSync(path.join(root, f)).isDirectory());
  dirs.forEach(testDir => {
    describe(testDir, () => {
      it('should run test', (done) => {
        new Executor(path.join('test', testDir)).exec('npm test', {}, done);
      });
    });
  });
});