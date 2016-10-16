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

    describe('when compiling typescript', () => {
      it('should not result in errors', (done) => {
        executor.exec('npm run tsc', {}, (errors) => done(errors));
      });
    });

    describe('when running stryker with a config file', () => {
      let resultOutput: string;
      before((done) => {
        executor.exec('npm run stryker:config', {}, (errors, stdout) => {
          resultOutput = stdout;
          done(errors);
        });
      });

      it('should have ran stryker', () => {
        expect(resultOutput).to.have.string('Initial test run succeeded. Ran 6 tests.');
        expect(resultOutput).to.have.string('Mutation score based on covered code');
        expect(resultOutput).to.have.string('Mutation score based on all code');
      });
    });
  });

});