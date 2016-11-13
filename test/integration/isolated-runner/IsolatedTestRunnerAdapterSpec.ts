import TestRunnerChildProcessAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import { TestRunnerFactory, TestRunner, RunOptions, RunResult, TestStatus, RunnerOptions, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import { expect } from 'chai';
import logger from '../../helpers/log4jsMock';

describe('TestRunnerChildProcessAdapter', function () {

  this.timeout(10000);

  let sut: TestRunnerChildProcessAdapter;
  let options: RunnerOptions = {
    strykerOptions: {
      plugins: [
        '../../test/integration/isolated-runner/DirectResolvedTestRunner',
        '../../test/integration/isolated-runner/NeverResolvedTestRunner',
        '../../test/integration/isolated-runner/SlowInitAndDisposeTestRunner',
        '../../test/integration/isolated-runner/CoverageReportingTestRunner',
        '../../test/integration/isolated-runner/DiscoverRegexTestRunner'],
      testRunner: 'karma',
      testFramework: 'jasmine',
      port: null,
      'someRegex': /someRegex/
    },
    files: [],
    port: null
  };

  describe('when sending a regex in the options', () => {
    before(() => sut = new TestRunnerChildProcessAdapter('discover-regex', options));

    it('correctly receive the regex on the other end',
      () => expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

  });

  describe('when test runner behind reports coverage', () => {
    before(() => sut = new TestRunnerChildProcessAdapter('coverage-reporting', options));

    it('should not be overriden by the worker',
      () => expect(sut.run({ timeout: 3000 })).to.eventually.have.property('coverage', 'realCoverage'));
  });

  describe('when test runner behind responds quickly', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('direct-resolved', options);
    });

    it('should run and resolve', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

    it('should report the coverage object if underlying test runner does not', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('coverage', 'coverageObject'));
  });

  describe('when test runner behind never responds', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('never-resolved', options);
      return sut.init();
    });

    it('should run and resolve in a timeout', () =>
      expect(sut.run({ timeout: 1000 })).to.eventually.satisfy((result: RunResult) => result.status === RunStatus.Timeout));

    it('should be able to recover from a timeout', () =>
      expect(sut.run({ timeout: 1000 }).then(() => sut.run({ timeout: 1000 }))).to.eventually.satisfy((result: RunResult) => result.status === RunStatus.Timeout));
  });

  describe('when test runner behind has a slow init and dispose cycle', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('slow-init-dispose', options);
      return sut.init();
    });
    it('should run only after it is initialized',
      () => expect(sut.run({ timeout: 20 })).to.eventually.satisfy((result: RunResult) => result.status === RunStatus.Complete));

    it('should be able to run twice in quick succession',
      () => expect(sut.run({ timeout: 20 }).then(() => sut.run({ timeout: 20 }))).to.eventually.satisfy((result: RunResult) => {
        return result.status === RunStatus.Complete;
      }));

    after(() => sut.dispose());
  });

}); 
