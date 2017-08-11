import * as path from 'path';
import { expect } from 'chai';
import { RunResult, RunStatus } from 'stryker-api/test_runner';
import ResilientTestRunnerFactory from '../../../src/isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from '../../../src/isolated-runner/IsolatedRunnerOptions';
import TestRunnerDecorator from '../../../src/isolated-runner/TestRunnerDecorator';
import log from '../../helpers/log4jsMock';

function sleep(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('ResilientTestRunnerFactory', function () {

  this.timeout(10000);

  let sut: TestRunnerDecorator;
  let options: IsolatedRunnerOptions = {
    strykerOptions: {
      plugins: ['../../test/integration/isolated-runner/AdditionalTestRunners'],
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
    before(() => sut = ResilientTestRunnerFactory.create('discover-regex', options));

    it('correctly receive the regex on the other end',
      () => expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

    after(() => sut.dispose());
  });

  describe('when test runner behind reports coverage', () => {
    before(() => sut = ResilientTestRunnerFactory.create('coverage-reporting', options));

    it('should not be overridden by the worker',
      () => expect(sut.run({ timeout: 3000 })).to.eventually.have.property('coverage', 'realCoverage'));

    after(() => sut.dispose());
  });

  describe('when test runner behind responds quickly', () => {
    before(() => {
      sut = ResilientTestRunnerFactory.create('direct-resolved', options);
    });

    it('should run and resolve', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('status', RunStatus.Complete));

    it('should report the coverage object if underlying test runner does not', () =>
      expect(sut.run({ timeout: 4000 })).to.eventually.have.property('coverage', 'coverageObject'));

    after(() => sut.dispose());
  });

  describe('when test runner behind never responds', () => {
    before(() => {
      sut = ResilientTestRunnerFactory.create('never-resolved', options);
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
      sut = ResilientTestRunnerFactory.create('errored', options);
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
      sut = ResilientTestRunnerFactory.create('slow-init-dispose', options);
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
      sut = ResilientTestRunnerFactory.create('verify-working-folder', options);
      return sut.init();
    });

    it('should run and resolve', () => sut.run({ timeout: 4000 })
      .then(result => {
        if (result.errorMessages && result.errorMessages.length) {
          expect.fail(null, null, result.errorMessages[0]);
        }
      }));
  });

  describe('when test runner is crashing after 100ms', () => {
    before(() => sut = ResilientTestRunnerFactory.create('time-bomb', options));

    it('should be able to recover from crash', () => {
      return sleep(101)
        .then(() => sut.run({ timeout: 2000 })
          .then(result => {
            expect(result.status).to.be.eq(RunStatus.Complete);
            expect(result.errorMessages).to.be.undefined;
          }));
    });
  });

  describe('when test runner handles promise rejections asynchronously', () => {
    before(() => sut = ResilientTestRunnerFactory.create('async-promise-rejection-handler', options));

    it('should be logging the unhandled rejection errors', async () => {
      await sut.init();
      await sut.run({ timeout: 2000 });
      expect(log.error).not.called;
    });
  });
}); 
