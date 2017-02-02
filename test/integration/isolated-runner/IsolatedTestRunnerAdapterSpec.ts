import * as path from 'path';
import { expect } from 'chai';
import { TestRunnerFactory, TestRunner, RunOptions, RunResult, TestStatus, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import TestRunnerChildProcessAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from '../../../src/isolated-runner/IsolatedRunnerOptions';

describe('TestRunnerChildProcessAdapter', function () {

  this.timeout(10000);

  let sut: TestRunnerChildProcessAdapter;
  let options: IsolatedRunnerOptions = {
    strykerOptions: {
      plugins: [
        '../../test/integration/isolated-runner/DirectResolvedTestRunner',
        '../../test/integration/isolated-runner/NeverResolvedTestRunner',
        '../../test/integration/isolated-runner/SlowInitAndDisposeTestRunner',
        '../../test/integration/isolated-runner/CoverageReportingTestRunner',
        '../../test/integration/isolated-runner/ErroredTestRunner',
        '../../test/integration/isolated-runner/VerifyWorkingFolderTestRunner',
        '../../test/integration/isolated-runner/DiscoverRegexTestRunner'],
      testRunner: 'karma',
      testFramework: 'jasmine',
      port: 0,
      'someRegex': /someRegex/
    },
    files: [],
    port: 0,
    sandboxWorkingFolder: path.resolve('./test/integration/isolated-runner')
  };

  describe('when sending a regex in the options', () => {
    before(() => sut = new TestRunnerChildProcessAdapter('discover-regex', options));

    it('correctly receive the regex on the other end',
      () => expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

    after(() => sut.dispose());
  });

  describe('when test runner behind reports coverage', () => {
    before(() => sut = new TestRunnerChildProcessAdapter('coverage-reporting', options));

    it('should not be overriden by the worker',
      () => expect(sut.run({ timeout: 3000 })).to.eventually.have.property('coverage', 'realCoverage'));

    after(() => sut.dispose());
  });

  describe('when test runner behind responds quickly', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('direct-resolved', options);
    });

    it('should run and resolve', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

    it('should report the coverage object if underlying test runner does not', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('coverage', 'coverageObject'));

    after(() => sut.dispose());
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

    after(() => sut.dispose());
  });

  describe('when test runner behind reports an error as `Error` instead of `string`', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('errored', options);
      return sut.init();
    });

    it('should report the error as `string`', () =>
      expect(sut.run({ timeout: 1000 })).to.eventually.satisfy((result: RunResult) => {
        // Issue https://github.com/stryker-mutator/stryker/issues/141
        expect(result.status).to.be.eq(RunStatus.Error);
        expect(result.errorMessages).to.have.length(1);
        if (result.errorMessages) {
          expect(result.errorMessages[0]).to.contain('SyntaxError: This is invalid syntax!\n    at ErroredTestRunner.run');
        }
        return true;
      }));

    after(() => sut.dispose());
  });

  describe('when test runner behind has a slow init and dispose cycle', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('slow-init-dispose', options);
      return sut.init();
    });
    it('should run only after it is initialized',
      () => expect(sut.run({ timeout: 1000 })).to.eventually.satisfy((result: RunResult) => {
        expect(result.status).to.be.eq(RunStatus.Complete, `Run status was ${RunStatus[result.status]}, while ${RunStatus[RunStatus.Complete]} expected`);
        return true;
      }));

    it('should be able to run twice in quick succession',
      () => expect(sut.run({ timeout: 1000 }).then(() => sut.run({ timeout: 20 }))).to.eventually.satisfy((result: RunResult) => {
        expect(result.status).to.be.eq(RunStatus.Complete, `Run status was ${RunStatus[result.status]}, while ${RunStatus[RunStatus.Complete]} expected`);
        return true;
      }));

    after(() => sut.dispose());
  });

  describe('when test runner verifies the current working folder', () => {
    before(() => {
      sut = new TestRunnerChildProcessAdapter('verify-working-folder', options);
      return sut.init();
    });

    it('should run and resolve', () => sut.run({ timeout: 4000 })
      .then(result => {
        if (result.errorMessages && result.errorMessages.length) {
          expect.fail(null, null, result.errorMessages[0]);
        }
      }));
  });
}); 
