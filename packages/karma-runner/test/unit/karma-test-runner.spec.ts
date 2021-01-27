import { EventEmitter } from 'events';

import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { DryRunStatus } from '@stryker-mutator/api/test-runner';
import { testInjector, assertions, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as karma from 'karma';
import * as sinon from 'sinon';

import strykerKarmaConf = require('../../src/starters/stryker-karma.conf');
import { KarmaTestRunner } from '../../src/karma-test-runner';
import * as projectStarter from '../../src/starters/project-starter';
import { StrykerKarmaSetup, NgConfigOptions } from '../../src-generated/karma-runner-options';
import { StrykerReporter } from '../../src/karma-plugins/stryker-reporter';
import { TestHooksMiddleware } from '../../src/karma-plugins/test-hooks-middleware';

describe(KarmaTestRunner.name, () => {
  let projectStarterMock: sinon.SinonStubbedInstance<projectStarter.ProjectStarter>;
  let setGlobalsStub: sinon.SinonStub;
  let reporterMock: EventEmitter;
  let karmaRunStub: sinon.SinonStub;
  let getLogger: LoggerFactoryMethod;
  let testHooksMiddlewareMock: sinon.SinonStubbedInstance<TestHooksMiddleware>;

  beforeEach(() => {
    reporterMock = new EventEmitter();
    projectStarterMock = sinon.createStubInstance(projectStarter.ProjectStarter);
    testHooksMiddlewareMock = sinon.createStubInstance(TestHooksMiddleware);
    sinon.stub(projectStarter, 'ProjectStarter').returns(projectStarterMock);
    sinon.stub(StrykerReporter, 'instance').value(reporterMock);
    setGlobalsStub = sinon.stub(strykerKarmaConf, 'setGlobals');
    karmaRunStub = sinon.stub(karma.runner, 'run');
    sinon.stub(TestHooksMiddleware, 'instance').value(testHooksMiddlewareMock);
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
      karmaConfigFile: undefined,
    });
  });

  it('should setup karma from stryker options', () => {
    const expectedSetup: StrykerKarmaSetup = {
      config: {
        basePath: 'foo/bar',
      },
      configFile: 'baz.conf.js',
      projectType: 'angular-cli',
    };
    testInjector.options.karma = expectedSetup;
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: expectedSetup.config,
      karmaConfigFile: expectedSetup.configFile,
    });

    expect(testInjector.logger.warn).not.called;
    expect(projectStarter.ProjectStarter).calledWith(sinon.match.func, expectedSetup);
  });
  it('should run ng test with parameters from stryker options', () => {
    const ngConfig: NgConfigOptions = {};
    ngConfig.testArguments = {
      project: '@ns/mypackage',
    };
    const expectedSetup: StrykerKarmaSetup = {
      config: {
        basePath: 'foo/bar',
      },
      configFile: 'baz.conf.js',
      ngConfig,
      projectType: 'angular-cli',
    };
    testInjector.options.karma = expectedSetup;
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: expectedSetup.config,
      karmaConfigFile: expectedSetup.configFile,
    });
    expect(testInjector.logger.warn).not.called;
    expect(projectStarter.ProjectStarter).calledWith(sinon.match.func, expectedSetup);
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

  describe('dryRun', () => {
    let sut: KarmaTestRunner;

    beforeEach(() => {
      sut = createSut();
      karmaRunStub.callsArgOn(1, 0);
    });

    it('should not execute "karma run" when results are already clear', async () => {
      reporterMock.emit('compile_error', ['foobar']);
      await sut.dryRun(factory.dryRunOptions());
      expect(karmaRunStub).not.called;
    });

    it('should clear run results between runs', async () => {
      const firstTestResult = factory.testResult();
      reporterMock.emit('test_result', firstTestResult);
      const actualFirstResult = await sut.dryRun(factory.dryRunOptions());
      const actualSecondResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(actualFirstResult);
      assertions.expectCompleted(actualSecondResult);
      expect(actualFirstResult.tests).deep.eq([firstTestResult]);
      expect(actualSecondResult.tests).lengthOf(0);
    });

    it('should configure the coverage analysis in the test hooks middleware', async () => {
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      expect(testHooksMiddlewareMock.configureCoverageAnalysis).calledWithExactly('all');
    });

    it('should add a test result when the on reporter raises the "test_result" event', async () => {
      const expected = factory.testResult();
      reporterMock.emit('test_result', expected);
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(actualResult);
      expect(actualResult.tests).deep.eq([expected]);
    });

    it('should add coverage report when the reporter raises the "coverage_report" event', async () => {
      const expectedCoverageReport = { some: 'coverage' };
      reporterMock.emit('coverage_report', expectedCoverageReport);
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(actualResult);
      expect(actualResult.mutantCoverage).eq(expectedCoverageReport);
    });

    it('should add error when the reporter raises the "browser_error" event', async () => {
      const expectedError = 'Global variable undefined';
      reporterMock.emit('browser_error', expectedError);
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(actualResult);
      expect(actualResult.errorMessage).deep.eq(expectedError);
    });

    it('should add error when the reporter raises the "compile_error" event', async () => {
      const expectedErrors = ['foo', 'bar'];
      reporterMock.emit('compile_error', expectedErrors);
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(actualResult);
      expect(actualResult.errorMessage).deep.eq('foo, bar');
    });

    it('should report state Error when tests where ran and run completed in an error', async () => {
      reporterMock.emit('test_result', factory.testResult());
      reporterMock.emit('browser_error', 'some error');
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(actualResult);
    });

    it('should report state Error when error messages were reported', async () => {
      reporterMock.emit('browser_error', 'Undefined var');
      reporterMock.emit('run_complete', DryRunStatus.Complete);
      const actualResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(actualResult);
    });
  });

  describe('mutantRun', () => {
    // it('should set testHooks middleware when testHooks are provided', async () => {
    //   await sut.run({ testHooks: 'foobar' });
    //   expect(TestHooksMiddleware.instance.currentTestHooks).eq('foobar');
    // });
  });
});
