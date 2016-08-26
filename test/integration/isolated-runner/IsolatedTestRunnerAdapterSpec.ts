import TestRunnerChildProcessAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import {TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult, RunnerOptions} from 'stryker-api/test_runner';
import {StrykerOptions} from 'stryker-api/core';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
let expect = chai.expect;
import * as log4js from 'log4js';

describe('TestRunnerChildProcessAdapter', function () {

  this.timeout(10000);

  let sut: TestRunnerChildProcessAdapter;
  let options: RunnerOptions = {
    strykerOptions: {
      plugins: [
        '../../test/integration/isolated-runner/DirectResolvedTestRunner',
        '../../test/integration/isolated-runner/NeverResolvedTestRunner',
        '../../test/integration/isolated-runner/SlowInitAndDisposeTestRunner'],
      testRunner: 'karma',
      testFramework: 'jasmine',
      port: null
    },
    files: [],
    port: null,
  };

  describe('when test runner behind responds quickly', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('direct-resolved', options);
    });

    it('should run and resolve', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Complete));

  });

  describe('when test runner behind never responds', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('never-resolved', options);
      return sut.init();
    });

    it('should run and resolve in a timeout', () =>
      expect(sut.run({ timeout: 1000 })).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Timeout));

    it('should be able to recover from a timeout', () =>
      expect(sut.run({ timeout: 1000 }).then(() => sut.run({ timeout: 1000 }))).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Timeout));
  });

  describe('when test runner behind has a slow init and dispose cycle', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('slow-init-dispose', options);
      return sut.init();
    });
    it('should run only after it is initialized',
      () => expect(sut.run({ timeout: 20 })).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Complete));

    it('should be able to run twice in quick succession',
      () => expect(sut.run({ timeout: 20 }).then(() => sut.run({ timeout: 20 }))).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Complete));

    after(() => sut.dispose());
  });

}); 
