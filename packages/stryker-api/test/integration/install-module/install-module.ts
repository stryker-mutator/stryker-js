import Executor from './Executor';
import {expect} from 'chai';

describe('we have a module using stryker', function () {

  this.timeout(100000);

  describe('after installing Stryker', () => {
    let executor: Executor;

    before((done) => {
      executor = new Executor('../../../testResources/module');
      executor.exec('npm install', {}, (errors) => done(errors));
    });

    describe('when typescript is compiled', () => {

      let arrangeActAndAssertModule = (moduleToRun: string, partsToBeAsserted: string[]) => {
        let stdOut: string;

        describe(`and i use the "${moduleToRun}" module`, () => {
          before((done) => {
            executor.exec(`npm run use:${moduleToRun}`, {}, (errors, out) => {
              stdOut = out;
              done(errors);
            });
          });

          it(`the output should contain ${partsToBeAsserted}`, () => {
            partsToBeAsserted.forEach(part => expect(stdOut).to.contain(part));
          });
        });
      };

      before((done) => {
        executor.exec('npm run tsc', {}, (errors) => done(errors));
      });

      arrangeActAndAssertModule('core', ['files', 'some', 'file', 'pattern']);
      arrangeActAndAssertModule('config', ['plugins: [ \'stryker-*\' ]', 'port: 9234']);
      arrangeActAndAssertModule('test_framework', ['framework-1']);
      arrangeActAndAssertModule('mutant', ['nodeID: 3', 'type: \'Literal\'']);
      arrangeActAndAssertModule('report', ['empty', 'all', 'status: 3', 'originalLines: \'string\'', 'Mutant status error: Error']);
      arrangeActAndAssertModule('test_runner', ['MyTestRunner']);

    });
  });
});