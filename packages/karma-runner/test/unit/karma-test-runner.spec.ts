import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector, assertions, factory, tick } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestResults } from 'karma';
import sinon from 'sinon';
import { Task } from '@stryker-mutator/util';
import { DryRunOptions, MutantRunOptions, TestRunnerCapabilities, TestStatus } from '@stryker-mutator/api/test-runner';
import { MutantCoverage } from '@stryker-mutator/api/core';

import { configureKarma } from '../../src/karma-plugins/stryker-karma.conf.js';
import { KarmaTestRunner } from '../../src/karma-test-runner.js';
import { ProjectStarter } from '../../src/starters/project-starter.js';
import { StrykerKarmaSetup } from '../../src-generated/karma-runner-options.js';
import { Browser, KarmaSpec, StrykerReporter } from '../../src/karma-plugins/stryker-reporter.js';
import { TestHooksMiddleware } from '../../src/karma-plugins/test-hooks-middleware.js';
import { karma } from '../../src/karma-wrapper.js';
import { pluginTokens } from '../../src/plugin-tokens.js';

// Unit tests for both the KarmaTestRunner and the StrykerReporter, as they are closely related

describe(KarmaTestRunner.name, () => {
  let projectStarterMock: sinon.SinonStubbedInstance<ProjectStarter>;
  let setGlobalsStub: sinon.SinonStubbedMember<typeof configureKarma.setGlobals>;
  let karmaRunStub: sinon.SinonStubbedMember<typeof karma.runner.run>;
  let getLogger: LoggerFactoryMethod;
  let testHooksMiddlewareMock: sinon.SinonStubbedInstance<TestHooksMiddleware>;

  beforeEach(() => {
    projectStarterMock = { start: sinon.stub() };
    testHooksMiddlewareMock = sinon.createStubInstance(TestHooksMiddleware);
    setGlobalsStub = sinon.stub(configureKarma, 'setGlobals');
    karmaRunStub = sinon.stub(karma.runner, 'run');
    sinon.stub(TestHooksMiddleware, 'instance').value(testHooksMiddlewareMock);
    getLogger = testInjector.injector.resolve(commonTokens.getLogger);
  });

  function createSut() {
    return testInjector.injector.provideValue(pluginTokens.projectStarter, projectStarterMock).injectClass(KarmaTestRunner);
  }

  describe('capabilities', () => {
    it('should communicate reloadEnvironment=true', () => {
      const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: true };
      expect(createSut().capabilities()).deep.eq(expectedCapabilities);
    });
  });

  it('should load default setup', () => {
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: undefined,
      karmaConfigFile: undefined,
      disableBail: false,
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
    testInjector.options.disableBail = true;
    createSut();
    expect(setGlobalsStub).calledWith({
      getLogger,
      karmaConfig: expectedSetup.config,
      karmaConfigFile: expectedSetup.configFile,
      disableBail: true,
    });
    expect(testInjector.logger.warn).not.called;
  });

  describe('init', () => {
    let sut: KarmaTestRunner;

    async function actInit() {
      const initPromise = sut.init();
      StrykerReporter.instance.onBrowsersReady();
      await initPromise;
    }

    beforeEach(async () => {
      sut = createSut();
      StrykerReporter.instance.karmaConfig = await karma.config.parseConfig(null, {}, { promiseConfig: true });
    });

    it('should start karma', async () => {
      projectStarterMock.start.resolves({ exitPromise: new Task<number>().promise });
      await actInit();
      expect(projectStarterMock.start).called;
    });

    it('should reject when karma start rejects', async () => {
      const expected = new Error('karma unavailable');
      projectStarterMock.start.rejects(expected);
      await expect(sut.init()).rejectedWith(expected);
    });

    it('should reject on browser errors', async () => {
      projectStarterMock.start.resolves({ exitPromise: new Task<number>().promise });
      const expected = new Error('karma unavailable');
      const onGoingInit = sut.init();
      StrykerReporter.instance.onBrowserError(createBrowser(), expected);
      await expect(onGoingInit).rejectedWith(expected);
    });

    it('should reject when karma exists during init', async () => {
      const exitTask = new Task<number>();
      projectStarterMock.start.resolves({ exitPromise: exitTask.promise });
      const onGoingInit = sut.init();
      exitTask.resolve(1);
      await expect(onGoingInit).rejectedWith(
        "Karma exited prematurely with exit code 1. Please run stryker with `--logLevel trace` to see the karma logging and figure out what's wrong."
      );
    });

    it('should reject on karma version prior to 6.3.0', async () => {
      sinon.stub(karma, 'VERSION').value('6.2.9');
      await expect(sut.init()).rejectedWith('Your karma version (6.2.9) is not supported. Please install 6.3.0 or higher');
    });

    it('should not reject when disposed early (#3486)', async () => {
      // Arrange
      const exitTask = new Task<number>();
      projectStarterMock.start.resolves({ exitPromise: exitTask.promise });
      const onGoingInit = sut.init();

      // Act
      await sut.dispose();
      exitTask.resolve(0);

      // Assert
      await expect(onGoingInit).not.rejected;
    });
  });

  describe('dryRun', () => {
    let sut: KarmaTestRunner;

    beforeEach(() => {
      sut = createSut();
      karmaRunStub.callsArgOnWith(1, null, 0);
    });

    function actDryRun({
      specResults = [],
      runResults = createKarmaTestResults(),
      options = factory.dryRunOptions(),
      mutantCoverage = factory.mutantCoverage(),
      browserError = undefined,
    }: {
      specResults?: KarmaSpec[];
      runResults?: TestResults;
      options?: DryRunOptions;
      mutantCoverage?: MutantCoverage;
      browserError?: [browser: Browser, error: any] | undefined;
    }) {
      const dryRunPromise = sut.dryRun(options);
      actRun({ browserError, specResults, mutantCoverage, hitCount: undefined, runResults });
      return dryRunPromise;
    }

    it('should report completed specs as test results', async () => {
      const specResults = [
        createKarmaSpec({ id: 'spec1', suite: ['foo'], description: 'should bar', time: 42, success: true }),
        createKarmaSpec({
          id: 'spec2',
          suite: ['bar', 'when baz'],
          description: 'should qux',
          log: ['expected quux to be qux', 'expected length of 1'],
          time: 44,
          success: false,
        }),
        createKarmaSpec({ id: 'spec3', suite: ['quux'], description: 'should corge', time: 45, skipped: true }),
      ];
      const expectedTests = [
        factory.testResult({ id: 'spec1', status: TestStatus.Success, timeSpentMs: 42, name: 'foo should bar' }),
        factory.testResult({
          id: 'spec2',
          status: TestStatus.Failed,
          timeSpentMs: 44,
          name: 'bar when baz should qux',
          failureMessage: 'expected quux to be qux, expected length of 1',
        }),
        factory.testResult({ id: 'spec3', status: TestStatus.Skipped, timeSpentMs: 45, name: 'quux should corge' }),
      ];
      const actualResult = await actDryRun({ specResults });
      assertions.expectCompleted(actualResult);
      expect(actualResult.tests).deep.eq(expectedTests);
    });

    it('should run karma with custom karma configuration', async () => {
      // Arrange
      projectStarterMock.start.resolves({ exitPromise: new Task<number>().promise });
      StrykerReporter.instance.karmaConfig = await karma.config.parseConfig(null, {}, { promiseConfig: true });
      StrykerReporter.instance.karmaConfig.hostname = 'www.localhost.com';
      StrykerReporter.instance.karmaConfig.port = 1337;
      StrykerReporter.instance.karmaConfig.listenAddress = 'www.localhost.com:1337';
      const parseConfigStub = sinon.stub(karma.config, 'parseConfig');
      const expectedRunConfig = { custom: 'config' };
      parseConfigStub.resolves(expectedRunConfig);
      const initPromise = sut.init();
      StrykerReporter.instance.onBrowsersReady();
      await initPromise;

      // Act
      await actDryRun({});

      // Assert
      expect(karmaRunStub).calledWith(expectedRunConfig, sinon.match.func);
      expect(parseConfigStub).calledWithExactly(null, { hostname: 'www.localhost.com', port: 1337, listenAddress: 'www.localhost.com:1337' });
    });

    it('should log when karma run is done', async () => {
      await actDryRun({});
      expect(testInjector.logger.debug).calledWith('karma run done with ', 0);
    });

    it('should clear run results between runs', async () => {
      const firstTestResult = createKarmaSpec({ id: 'spec1', suite: ['foo'], description: 'should bar', time: 42, success: true });
      const expectedTestResult = factory.testResult({ id: 'spec1', status: TestStatus.Success, timeSpentMs: 42, name: 'foo should bar' });
      const actualFirstResult = await actDryRun({ specResults: [firstTestResult] });
      const actualSecondResult = await actDryRun({});
      assertions.expectCompleted(actualFirstResult);
      assertions.expectCompleted(actualSecondResult);
      expect(actualFirstResult.tests).deep.eq([expectedTestResult]);
      expect(actualSecondResult.tests).lengthOf(0);
    });

    it('should configure the coverage analysis in the test hooks middleware', async () => {
      await actDryRun({ options: factory.dryRunOptions({ coverageAnalysis: 'all' }) });
      expect(testHooksMiddlewareMock.configureCoverageAnalysis).calledWithExactly('all');
    });

    it('should add coverage report when the reporter raises the "coverage_report" event', async () => {
      const expectedCoverageReport = factory.mutantCoverage({ static: { '1': 4 } });
      const actualResult = await actDryRun({ mutantCoverage: expectedCoverageReport });
      assertions.expectCompleted(actualResult);
      expect(actualResult.mutantCoverage).eq(expectedCoverageReport);
    });

    it('should add error when the reporter raises the "browser_error" event', async () => {
      const expectedError = 'Global variable undefined';
      const actualResult = await actDryRun({ runResults: createKarmaTestResults({ error: true }), browserError: [createBrowser(), expectedError] });
      assertions.expectErrored(actualResult);
      expect(actualResult.errorMessage).deep.eq(expectedError);
    });

    it('should report state Error when tests where ran and run completed in an error', async () => {
      const actualResult = await actDryRun({
        runResults: createKarmaTestResults({ error: true }),
        specResults: [createKarmaSpec()],
        browserError: [createBrowser(), 'some error'],
      });
      assertions.expectErrored(actualResult);
    });
  });

  describe('mutantRun', () => {
    let sut: KarmaTestRunner;

    function actMutantRun({
      specResults = [],
      runResults = createKarmaTestResults(),
      options = factory.mutantRunOptions(),
      mutantCoverage = factory.mutantCoverage(),
      hitCount = undefined,
      browserError = undefined,
    }: {
      specResults?: KarmaSpec[];
      runResults?: TestResults;
      options?: MutantRunOptions;
      hitCount?: number;
      mutantCoverage?: MutantCoverage;
      browserError?: [browser: Browser, error: any] | undefined;
    }) {
      const promise = sut.mutantRun(options);
      actRun({ specResults, runResults, mutantCoverage, hitCount, browserError });
      return promise;
    }

    beforeEach(() => {
      sut = createSut();
      karmaRunStub.callsArgOn(1, 0);
    });

    it('should configure the mutant run on the middleware', async () => {
      const options = factory.mutantRunOptions({ testFilter: ['foobar'] });
      await actMutantRun({ options });
      expect(testHooksMiddlewareMock.configureMutantRun).calledOnceWithExactly(options);
    });

    it('should correctly report a survived mutant', async () => {
      const result = await actMutantRun({ specResults: [createKarmaSpec({ success: true })] });
      assertions.expectSurvived(result);
      expect(result.nrOfTests).eq(1);
    });

    it('should correctly report a killed mutant', async () => {
      const result = await actMutantRun({ specResults: [createKarmaSpec({ success: true }), createKarmaSpec({ success: false })] });
      assertions.expectKilled(result);
      expect(result.nrOfTests).eq(2);
    });

    it('should report a timeout when the browser disconnects', async () => {
      arrangeLauncherMock();
      const onGoingRun = sut.mutantRun(factory.mutantRunOptions());
      StrykerReporter.instance.onRunStart();
      StrykerReporter.instance.onBrowserError(createBrowser({ id: '42', state: 'DISCONNECTED' }), 'disconnected');
      StrykerReporter.instance.onRunComplete(null, createKarmaTestResults({ disconnected: true }));
      StrykerReporter.instance.onBrowsersReady();
      const result = await onGoingRun;
      assertions.expectTimeout(result);
      expect(result.reason).eq('Browser disconnected during test execution. Karma error: disconnected');
    });

    it('should restart the browser and wait until it is restarted when it gets disconnected (issue #2989)', async () => {
      // Arrange
      const { launcher, karmaServer } = arrangeLauncherMock();

      // Act
      let runCompleted = false;
      const onGoingRun = sut.mutantRun(factory.mutantRunOptions()).then(() => (runCompleted = true));
      StrykerReporter.instance.onRunStart();
      StrykerReporter.instance.onBrowserError(createBrowser({ id: '42', state: 'DISCONNECTED' }), 'disconnected');

      // Assert
      expect(launcher.restart).calledWith('42');
      expect(karmaServer.get).calledWith('launcher');
      StrykerReporter.instance.onRunComplete(null, createKarmaTestResults({ disconnected: true }));
      await tick();
      expect(runCompleted).false;
      StrykerReporter.instance.onBrowsersReady();
      await onGoingRun;
    });

    it('should report a timeout when the hitLimit was reached', async () => {
      const result = await actMutantRun({
        options: factory.mutantRunOptions({ hitLimit: 9 }),
        specResults: [createKarmaSpec({ success: false })],
        hitCount: 10,
      });
      assertions.expectTimeout(result);
      expect(result.reason).contains('Hit limit reached (10/9)');
    });

    it('should reset the hitLimit between runs', async () => {
      const firstResult = await actMutantRun({
        options: factory.mutantRunOptions({ hitLimit: 9 }),
        specResults: [createKarmaSpec({ success: false })],
        hitCount: 10,
      });
      const secondResult = await actMutantRun({
        options: factory.mutantRunOptions({ hitLimit: undefined }),
        specResults: [createKarmaSpec({ success: false })],
        hitCount: 10,
      });
      assertions.expectTimeout(firstResult);
      assertions.expectKilled(secondResult);
    });
  });

  describe('dispose', () => {
    beforeEach(async () => {
      StrykerReporter.instance.karmaConfig = await karma.config.parseConfig(null, {}, { promiseConfig: true });
    });

    it('should not do anything if there is no karma server', async () => {
      const sut = createSut();
      await expect(sut.dispose()).not.rejected;
    });

    it('should stop the karma server', async () => {
      const karmaServerMock = sinon.createStubInstance(karma.Server);
      StrykerReporter.instance.karmaServer = karmaServerMock;
      const sut = createSut();
      await sut.dispose();
      expect(karmaServerMock.stop).called;
    });

    it('should await the exit promise provided at startup', async () => {
      // Arrange
      const sut = createSut();
      const karmaServerMock = sinon.createStubInstance(karma.Server);
      StrykerReporter.instance.karmaServer = karmaServerMock;
      const exitTask = new Task<number>();
      let disposeResolved = false;
      projectStarterMock.start.resolves({ exitPromise: exitTask.promise });
      const initPromise = sut.init();
      StrykerReporter.instance.onBrowsersReady();
      await initPromise;

      // Act
      const onGoingDisposal = sut.dispose().then(() => (disposeResolved = true));

      // Assert
      await tick();
      expect(disposeResolved).false;
      exitTask.resolve(1);
      await onGoingDisposal;
    });
  });

  function actRun({
    specResults,
    runResults,
    mutantCoverage,
    hitCount,
    browserError,
  }: {
    specResults: KarmaSpec[];
    runResults: TestResults;
    mutantCoverage: MutantCoverage;
    hitCount: number | undefined;
    browserError: [browser: Browser, error: any] | undefined;
  }) {
    StrykerReporter.instance.onRunStart();
    specResults.forEach((spec) => StrykerReporter.instance.onSpecComplete(null, spec));
    if (browserError) {
      StrykerReporter.instance.onBrowserError(...browserError);
    }
    StrykerReporter.instance.onBrowserComplete(null, { mutantCoverage, hitCount });
    StrykerReporter.instance.onRunComplete(null, runResults);
  }
});

function arrangeLauncherMock() {
  const karmaServerMock = sinon.createStubInstance(karma.Server);
  const launcherMock = sinon.createStubInstance(karma.launcher.Launcher);
  StrykerReporter.instance.karmaServer = karmaServerMock;
  karmaServerMock.get.returns(launcherMock);
  return { launcher: launcherMock, karmaServer: karmaServerMock };
}

function createKarmaSpec(overrides?: Partial<KarmaSpec>): KarmaSpec {
  return {
    description: 'baz',
    id: '1',
    log: [],
    skipped: false,
    success: true,
    suite: ['foo', 'bar'],
    time: 42,
    ...overrides,
  };
}

function createKarmaTestResults(overrides?: Partial<TestResults>): TestResults {
  return {
    disconnected: false,
    error: false,
    exitCode: 0,
    failed: 0,
    success: 0,
    ...overrides,
  };
}

function createBrowser(overrides?: Partial<Browser>): Browser {
  return {
    id: '123123',
    state: 'CONNECTED',
    ...overrides,
  };
}
