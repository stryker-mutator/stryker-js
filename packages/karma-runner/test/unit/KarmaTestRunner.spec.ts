import { EventEmitter } from 'events';

import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as karma from 'karma';
import * as sinon from 'sinon';

import strykerKarmaConf = require('../../src/starters/stryker-karma.conf');
import KarmaTestRunner from '../../src/KarmaTestRunner';
import ProjectStarter, * as projectStarterModule from '../../src/starters/ProjectStarter';
import { StrykerKarmaSetup, NgConfigOptions } from '../../src-generated/karma-runner-options';
import StrykerReporter from '../../src/StrykerReporter';
import TestHooksMiddleware from '../../src/TestHooksMiddleware';

describe('KarmaTestRunner', () => {
  let projectStarterMock: sinon.SinonStubbedInstance<ProjectStarter>;
  let setGlobalsStub: sinon.SinonStub;
  let reporterMock: EventEmitter;
  let karmaRunStub: sinon.SinonStub;
  let getLogger: LoggerFactoryMethod;

  beforeEach(() => {
    reporterMock = new EventEmitter();
    projectStarterMock = sinon.createStubInstance(ProjectStarter);
    sinon.stub(projectStarterModule, 'default').returns(projectStarterMock);
    sinon.stub(StrykerReporter, 'instance').value(reporterMock);
    setGlobalsStub = sinon.stub(strykerKarmaConf, 'setGlobals');
    karmaRunStub = sinon.stub(karma.runner, 'run');
    sinon.stub(TestHooksMiddleware, 'instance').value({});
    getLogger = testInjector.injector.resolve(commonTokens.getLogger);
  });

  function createSut() {
    return testInjector.injector.injectClass(KarmaTestRunner);
  }

  it('should load default setup', () => {
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: undefined,
      karmaConfigFile: undefined
    });
  });

  it('should setup karma from stryker options', () => {
    const expectedSetup: StrykerKarmaSetup = {
      config: {
        basePath: 'foo/bar'
      },
      configFile: 'baz.conf.js',
      projectType: 'angular-cli'
    };
    testInjector.options.karma = expectedSetup;
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: expectedSetup.config,
      karmaConfigFile: expectedSetup.configFile
    });

    expect(testInjector.logger.warn).not.called;
    expect(projectStarterModule.default).calledWith(sinon.match.func, expectedSetup);
  });
  it('should run ng test with parameters from stryker options', () => {
    const ngConfig: NgConfigOptions = {};
    ngConfig.testArguments = {
      project: '@ns/mypackage'
    };
    const expectedSetup: StrykerKarmaSetup = {
      config: {
        basePath: 'foo/bar'
      },
      configFile: 'baz.conf.js',
      ngConfig,
      projectType: 'angular-cli'
    };
    testInjector.options.karma = expectedSetup;
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: expectedSetup.config,
      karmaConfigFile: expectedSetup.configFile
    });
    expect(testInjector.logger.warn).not.called;
    expect(projectStarterModule.default).calledWith(sinon.match.func, expectedSetup);
  });

  describe('init', () => {
    let sut: KarmaTestRunner;

    beforeEach(() => {
      sut = createSut();
    });

    it('should start karma', async () => {
      projectStarterMock.start.resolves();
      const initPromise = sut.init();
      reporterMock.emit('browsers_ready');
      await initPromise;
      expect(projectStarterMock.start).called;
    });

    it('should reject when karma start rejects', async () => {
      const expected = new Error('karma unavailable');
      projectStarterMock.start.rejects(expected);
      await expect(sut.init()).rejectedWith(expected);
    });
  });

  describe('run', () => {
    let sut: KarmaTestRunner;

    beforeEach(() => {
      sut = createSut();
      karmaRunStub.callsArgOn(1, 0);
    });

    it('should not execute "karma run" when results are already clear', async () => {
      reporterMock.emit('compile_error', ['foobar']);
      await sut.run({});
      expect(karmaRunStub).not.called;
    });

    it('should clear run results between runs', async () => {
      const firstTestResult = testResult();
      reporterMock.emit('test_result', firstTestResult);
      const actualFirstResult = await sut.run({});
      const actualSecondResult = await sut.run({});
      expect(actualFirstResult.tests).deep.eq([firstTestResult]);
      expect(actualSecondResult.tests).lengthOf(0);
    });

    it('should set testHooks middleware to empty if no testHooks provided', async () => {
      await sut.run({});
      expect(TestHooksMiddleware.instance.currentTestHooks).eq('');
    });

    it('should set testHooks middleware when testHooks are provided', async () => {
      await sut.run({ testHooks: 'foobar' });
      expect(TestHooksMiddleware.instance.currentTestHooks).eq('foobar');
    });

    it('should add a test result when the on reporter raises the "test_result" event', async () => {
      const expected = testResult();
      reporterMock.emit('test_result', expected);
      const actualResult = await sut.run({});
      expect(actualResult.tests).deep.eq([expected]);
    });

    it('should add coverage report when the reporter raises the "coverage_report" event', async () => {
      const expectedCoverageReport = { some: 'coverage' };
      reporterMock.emit('coverage_report', expectedCoverageReport);
      const actualResult = await sut.run({});
      expect(actualResult.coverage).eq(expectedCoverageReport);
    });

    it('should add error when the reporter raises the "browser_error" event', async () => {
      const expectedError = 'Global variable undefined';
      reporterMock.emit('browser_error', expectedError);
      const actualResult = await sut.run({});
      expect(actualResult.errorMessages).deep.eq([expectedError]);
    });

    it('should add error when the reporter raises the "compile_error" event', async () => {
      const expectedErrors = ['foo', 'bar'];
      reporterMock.emit('compile_error', expectedErrors);
      const actualResult = await sut.run({});
      expect(actualResult.errorMessages).deep.eq(expectedErrors);
    });

    it('should set result status when the reporter raises the "run_complete" event', async () => {
      reporterMock.emit('run_complete', RunStatus.Timeout);
      const actualResult = await sut.run({});
      expect(actualResult.status).eq(RunStatus.Timeout);
    });

    it('should convert run state Error to a Complete when no tests where ran or no error messages where reported', async () => {
      reporterMock.emit('run_complete', RunStatus.Error);
      const actualResult = await sut.run({});
      expect(actualResult.status).eq(RunStatus.Complete);
    });

    it('should report state Error when tests where ran and run completed in an error', async () => {
      reporterMock.emit('test_result', testResult());
      reporterMock.emit('run_complete', RunStatus.Error);
      const actualResult = await sut.run({});
      expect(actualResult.status).eq(RunStatus.Error);
    });

    it('should report state Error when error messages were reported', async () => {
      reporterMock.emit('browser_error', 'Undefined var');
      reporterMock.emit('run_complete', RunStatus.Complete);
      const actualResult = await sut.run({});
      expect(actualResult.status).eq(RunStatus.Error);
    });
  });

  function testResult(overrides?: Partial<TestResult>): TestResult {
    return Object.assign(
      {
        name: 'foobar',
        status: TestStatus.Success,
        timeSpentMs: 0
      },
      overrides
    );
  }
});
