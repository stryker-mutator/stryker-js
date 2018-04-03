import { expect } from 'chai';
import { exec } from 'mz/child_process';
import * as path from 'path';

describe('we have a module using stryker', function () {

  this.timeout(100000);

  const modulePath = path.resolve(__dirname, '../../../testResources/module');

  const execInModule = (command: string) => {
    console.log(`Exec '${command}' in ${modulePath}`);
    return exec(command, { cwd: modulePath });
  };

  describe('after installing Stryker', () => {

    before(() => {
      return execInModule('npm install')
        .then(() => execInModule('npm run tsc'));
    });

    describe('when typescript is compiled', () => {

      const arrangeActAndAssertModule = (moduleToRun: string, partsToBeAsserted: string[]) => {
        it(`should output "${partsToBeAsserted}" when using the "${moduleToRun}" module`, () => {
          return execInModule(`npm run use:${moduleToRun}`).then(([stdout]) => {
            partsToBeAsserted.forEach(part => expect(stdout).to.contain(part));
          });
        });
      };
      arrangeActAndAssertModule('core', ['files', 'some', 'file']);
      arrangeActAndAssertModule('config', ['plugins: [ \'stryker-*\' ]', 'port: 9234']);
      arrangeActAndAssertModule('test_framework', ['framework-1']);
      arrangeActAndAssertModule('mutant', ['mutatorName: \'foo\'']);
      arrangeActAndAssertModule('report', ['empty', 'all', 'status: 3', 'originalLines: \'string\'', 'Mutant status runtime error: RuntimeError', 'transpile error: TranspileError']);
      arrangeActAndAssertModule('test_runner', ['MyTestRunner']);
      arrangeActAndAssertModule('transpile', ['foo', 'bar']);
    });
  });
});