import Executor from './Executor';

describe('we have a module using stryker', function() {

  this.timeout(100000);

  describe('after installing Stryker', () => {
    let executor: Executor

    before((done) => {
      executor = new Executor('module');
      executor.exec('npm install', {}, done);
    });

    describe('when compiling typescript', () => {
      it('should not result in errors', (done) => {
        executor.exec('npm run tsc', {}, done);
      });
    });
  });

});