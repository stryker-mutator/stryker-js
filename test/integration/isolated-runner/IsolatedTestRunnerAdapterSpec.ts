import TestRunnerChildProcessAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import {TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult, RunnerOptions} from '../../../src/api/test_runner';
import {StrykerOptions} from '../../../src/api/core';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('TestRunnerChildProcessAdapter', function() {

  this.timeout(10000);
  
  let sut: TestRunnerChildProcessAdapter;
  let options: RunnerOptions = {
    strykerOptions: {
      plugins: ['../../test/integration/isolated-runner/DirectResolvedTestRunner', '../../test/integration/isolated-runner/NeverResolvedTestRunner'],
      testRunner: 'karma',
      testFrameork: 'jasmine',
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
    });

    it('should run and resolve in a timeout', () =>
      expect(sut.run({ timeout: 1000 })).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Timeout));

    it('should be able to recover from a timeout', () =>
      expect(sut.run({ timeout: 1000 }).then(() => sut.run({ timeout: 1000 }))).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Timeout));
  });

}); 