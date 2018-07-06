import { EventEmitter } from 'events';
import { expect } from 'chai';
import * as log4js from 'log4js';
import * as karma from 'karma';
import strykerKarmaConf = require('../../src/starters/stryker-karma.conf');
import ProjectStarter, * as projectStarterModule from '../../src/starters/ProjectStarter';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { RunnerOptions, TestResult, TestStatus, RunStatus } from 'stryker-api/test_runner';
import LoggerStub from '../helpers/LoggerStub';
import StrykerKarmaSetup, { DEPRECATED_KARMA_CONFIG, DEPRECATED_KARMA_CONFIG_FILE } from '../../src/StrykerKarmaSetup';
import StrykerReporter from '../../src/StrykerReporter';
import TestHooksMiddleware from '../../src/TestHooksMiddleware';

describe('KarmaTestRunner', () => {

  let projectStarterMock: sinon.SinonStubbedInstance<ProjectStarter>;
  let settings: RunnerOptions;
  let setGlobalsStub: sinon.SinonStub;
  let logMock: LoggerStub;
  let reporterMock: EventEmitter;
  let karmaRunStub: sinon.SinonStub;

  beforeEach(() => {
    settings = {
      port: 42, fileNames: ['foo.js', 'bar.js'], strykerOptions: {}
    };
    reporterMock = new EventEmitter();
    projectStarterMock = sandbox.createStubInstance(ProjectStarter);
    logMock = new LoggerStub();
    sandbox.stub(projectStarterModule, 'default').returns(projectStarterMock);
    sandbox.stub(log4js, 'getLogger').returns(logMock);
    sandbox.stub(StrykerReporter, 'instance').value(reporterMock);
    setGlobalsStub = sandbox.stub(strykerKarmaConf, 'setGlobals');
    karmaRunStub = sandbox.stub(karma.runner, 'run');
    sandbox.stub(TestHooksMiddleware, 'instance').value({});
  });

  it('should load default setup', () => {
    new KarmaTestRunner(settings);
    expect(setGlobalsStub).calledWith({ port: 42, karmaConfig: undefined, karmaConfigFile: undefined });
  });

  it('should setup karma from stryker options', () => {
    const expectedSetup: StrykerKarmaSetup = {
      project: 'angular-cli',
      config: {
        basePath: 'foo/bar'
      },
      configFile: 'baz.conf.js'
    };
    settings.strykerOptions['karma'] = expectedSetup;
    new KarmaTestRunner(settings);
    expect(setGlobalsStub).calledWith({ port: 42, karmaConfig: expectedSetup.config, karmaConfigFile: expectedSetup.configFile });
    expect(logMock.warn).not.called;
    expect(projectStarterModule.default).calledWith(expectedSetup.project);
  });

  it('should load deprecated karma options', () => {
    const expectedKarmaConfig = { basePath: 'foobar' };
    const expectedKarmaConfigFile = 'karmaConfigFile';
    settings.strykerOptions[DEPRECATED_KARMA_CONFIG] = expectedKarmaConfig;
    settings.strykerOptions[DEPRECATED_KARMA_CONFIG_FILE] = expectedKarmaConfigFile;
    new KarmaTestRunner(settings);
    expect(setGlobalsStub).calledWith({ port: 42, karmaConfig: expectedKarmaConfig, karmaConfigFile: expectedKarmaConfigFile });
    expect(logMock.warn).calledTwice;
    expect(logMock.warn).calledWith('[deprecated]: config option karmaConfigFile is renamed to karma.configFile');
    expect(logMock.warn).calledWith('[deprecated]: config option karmaConfig is renamed to karma.config');
  });

  describe('init', () => {
    let sut: KarmaTestRunner;

    beforeEach(() => {
      sut = new KarmaTestRunner(settings);
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
      sut = new KarmaTestRunner(settings);
      karmaRunStub.callsArgOn(1, 0);
    });

    it('should execute "karma run"', async () => {
      await sut.run({});
      expect(karmaRunStub).calledWith({ port: settings.port });
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
    return Object.assign({
      name: 'foobar',
      status: TestStatus.Success,
      timeSpentMs: 0
    }, overrides);
  }
});