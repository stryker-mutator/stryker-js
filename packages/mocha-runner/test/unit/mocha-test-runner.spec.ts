import { expect } from 'chai';
import Mocha from 'mocha';
import { testInjector, factory, assertions, tick } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { KilledMutantRunResult, MutantRunStatus, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { Task } from '@stryker-mutator/util';

import { MochaTestRunner } from '../../src/mocha-test-runner.js';
import { StrykerMochaReporter } from '../../src/stryker-mocha-reporter.js';
import { MochaAdapter } from '../../src/mocha-adapter.js';
import * as pluginTokens from '../../src/plugin-tokens.js';
import { MochaOptionsLoader } from '../../src/mocha-options-loader.js';
import { createMochaOptions } from '../helpers/factories.js';

describe(MochaTestRunner.name, () => {
  let mocha: sinon.SinonStubbedInstance<Mocha> & { suite: sinon.SinonStubbedInstance<Mocha.Suite>; dispose?: sinon.SinonStub };
  let mochaAdapterMock: sinon.SinonStubbedInstance<MochaAdapter>;
  let mochaOptionsLoaderMock: sinon.SinonStubbedInstance<MochaOptionsLoader>;
  let reporterMock: sinon.SinonStubbedInstance<StrykerMochaReporter>;
  let testFileNames: string[];

  beforeEach(() => {
    reporterMock = sinon.createStubInstance(StrykerMochaReporter);
    reporterMock.tests = [];
    mochaAdapterMock = sinon.createStubInstance(MochaAdapter);
    mochaOptionsLoaderMock = sinon.createStubInstance(MochaOptionsLoader);
    mocha = sinon.createStubInstance(Mocha) as any;
    mocha.suite = sinon.createStubInstance(Mocha.Suite) as any;
    mocha.suite.suites = [];
    mochaAdapterMock.create.returns(mocha as unknown as Mocha);
    testFileNames = [];
    mochaAdapterMock.collectFiles.returns(testFileNames);
  });

  afterEach(() => {
    delete StrykerMochaReporter.log;
  });

  function createSut(): MochaTestRunner {
    return testInjector.injector
      .provideValue(pluginTokens.mochaAdapter, mochaAdapterMock)
      .provideValue(pluginTokens.loader, mochaOptionsLoaderMock)
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(MochaTestRunner);
  }

  describe('constructor', () => {
    it('should set the static `log` property on StrykerMochaReporter', () => {
      createSut();
      expect(StrykerMochaReporter.log).eq(testInjector.logger);
    });
  });

  describe('capabilities', () => {
    it('should communicate reloadEnvironment=false', async () => {
      const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: false };
      expect(await createSut().capabilities()).deep.eq(expectedCapabilities);
    });
  });

  describe(MochaTestRunner.prototype.init.name, () => {
    let sut: MochaTestRunner;
    beforeEach(() => {
      sut = createSut();
    });

    it('should load mocha options', async () => {
      mochaOptionsLoaderMock.load.returns({});
      await sut.init();
      expect(mochaOptionsLoaderMock.load).calledWithExactly(testInjector.options);
    });

    it('should collect the files', async () => {
      testFileNames.push('foo.js', 'foo.spec.js');
      const mochaOptions = Object.freeze(createMochaOptions());
      mochaOptionsLoaderMock.load.returns(mochaOptions);

      await sut.init();

      expect(mochaAdapterMock.collectFiles).calledWithExactly(mochaOptions);
      testFileNames.forEach((fileName) => {
        expect(mocha.addFile).calledWith(fileName);
      });
    });

    it('should not handle requires when there are no `requires`', async () => {
      mochaOptionsLoaderMock.load.returns({});
      await sut.init();
      expect(mochaAdapterMock.handleRequires).not.called;
    });

    it('should handle requires and collect root hooks', async () => {
      const requires = ['test/setup.js'];

      const expectedRootHooks = { beforeEach() {} };
      mochaOptionsLoaderMock.load.returns(createMochaOptions({ require: requires }));
      mochaAdapterMock.handleRequires.resolves(expectedRootHooks);

      await sut.init();

      const expectedMochaOptions: Mocha.MochaOptions = { rootHooks: expectedRootHooks };
      expect(mochaAdapterMock.create).calledWith(sinon.match(expectedMochaOptions));
    });

    it('should reject when requires contains "esm" (see #3014)', async () => {
      const requires = ['esm', 'ts-node/require'];
      mochaOptionsLoaderMock.load.returns(createMochaOptions({ require: requires }));
      await expect(sut.init()).rejectedWith(
        'Config option "mochaOptions.require" does not support "esm", please use `"testRunnerNodeArgs": ["--require", "esm"]` instead. See https://github.com/stryker-mutator/stryker-js/issues/3014 for more information.',
      );
    });

    it('should pass along supported options to mocha', async () => {
      // Arrange
      const mochaOptions = Object.freeze(
        createMochaOptions({
          'async-only': true,
          grep: 'grepme',
          opts: 'opts',
          require: [],
          ui: 'exports',
        }),
      );
      mochaOptionsLoaderMock.load.returns(mochaOptions);

      // Act
      await sut.init();

      // Assert
      expect(mocha.asyncOnly).called;
      expect(mocha.ui).calledWith('exports');
      expect(mocha.grep).calledWith('grepme');
    });

    it('should force timeout off', async () => {
      mochaOptionsLoaderMock.load.returns({});
      await sut.init();
      expect(mochaAdapterMock.create).calledWithMatch({ timeout: 0 });
    });

    it('should not set asyncOnly if asyncOnly is false', async () => {
      // Arrange
      const mochaOptions = Object.freeze(
        createMochaOptions({
          'async-only': false,
        }),
      );
      mochaOptionsLoaderMock.load.returns(mochaOptions);

      // Act
      await sut.init();
      expect(mocha.asyncOnly).not.called;
    });
  });

  describe(MochaTestRunner.prototype.dryRun.name, () => {
    let sut: MochaTestRunner;
    beforeEach(async () => {
      mochaOptionsLoaderMock.load.returns({});
      sut = createSut();
      await sut.init();
    });

    it('should load files the first time', async () => {
      await actDryRun();
      expect(mocha.loadFilesAsync).calledOnceWithExactly();
      expect(mocha.loadFilesAsync).calledBefore(mocha.run);
    });

    it('should not load files again the second time', async () => {
      await actDryRun();
      await actDryRun();
      expect(mocha.loadFilesAsync).calledOnceWithExactly();
    });

    it('should set bail to true when disableBail is false', async () => {
      const childSuite = sinon.createStubInstance(Mocha.Suite);
      mocha.suite.suites.push(childSuite);
      childSuite.suites = [];
      await actDryRun(factory.dryRunOptions({ disableBail: false }));
      expect(mocha.suite.bail).calledWith(true);
      expect(childSuite.bail).calledWith(true);
    });

    it('should set bail to false when disableBail is true', async () => {
      const childSuite = sinon.createStubInstance(Mocha.Suite);
      mocha.suite.suites.push(childSuite);
      childSuite.suites = [];
      await actDryRun(factory.dryRunOptions({ disableBail: true }));
      expect(mocha.suite.bail).calledWith(false);
      expect(childSuite.bail).calledWith(false);
    });

    it('should add a beforeEach hook if coverage analysis is "perTest"', async () => {
      const runPromise = sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
      sut.beforeEach!({ currentTest: { fullTitle: () => 'foo should be bar' } } as Mocha.Context);
      mocha.run.callsArg(0);
      await runPromise;
      expect(sut.beforeEach).undefined;
      expect(global.__stryker2__?.currentTestId).eq('foo should be bar');
    });

    it('should not add a beforeEach hook if coverage analysis isn\'t "perTest"', async () => {
      const runPromise = sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      expect(sut.beforeEach).undefined;
      mocha.run.callsArg(0);
      await runPromise;
    });

    it('should collect mutant coverage', async () => {
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = [];
      global.__stryker2__!.mutantCoverage = factory.mutantCoverage({ static: { 1: 2 } });
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).deep.eq(factory.mutantCoverage({ static: { 1: 2 } }));
    });

    it('should not collect mutant coverage if coverageAnalysis is "off"', async () => {
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = [];
      global.__stryker2__!.mutantCoverage = factory.mutantCoverage({ static: { 1: 2 } });
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).undefined;
    });

    it('should result in the reported tests', async () => {
      const expectedTests = [factory.successTestResult(), factory.failedTestResult()];
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = expectedTests;
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectCompleted(result);
      expect(result.tests).eq(expectedTests);
    });

    it("should result an error if the StrykerMochaReporter isn't set correctly", async () => {
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectErrored(result);
      expect(result.errorMessage).eq("Mocha didn't instantiate the StrykerMochaReporter correctly. Test result cannot be reported.");
    });

    async function actDryRun(options = factory.dryRunOptions()) {
      mocha.run.callsArg(0);
      return sut.dryRun(options);
    }
  });

  describe(MochaTestRunner.prototype.mutantRun.name, () => {
    let sut: MochaTestRunner;

    beforeEach(async () => {
      mochaOptionsLoaderMock.load.returns({});
      sut = createSut();
      await sut.init();
      StrykerMochaReporter.currentInstance = reporterMock;
    });

    it("should activate the given mutant statically when mutantActivation = 'static'", async () => {
      // Arrange
      const loadFilesAsyncTask = new Task();
      mocha.loadFilesAsync.returns(loadFilesAsyncTask.promise);

      // Act
      const onGoingAct = actMutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutantTestCoverage({ id: '42' }), mutantActivation: 'static' }),
      );

      // Assert
      expect(global.__stryker2__?.activeMutant).eq('42');
      loadFilesAsyncTask.resolve();
      await tick();
      expect(global.__stryker2__?.activeMutant).eq('42');
      expect(mocha.run).called;
      await onGoingAct;
    });

    it("should activate the given mutant at runtime when mutantActivation = 'runtime'", async () => {
      // Arrange
      const loadFilesAsyncTask = new Task();
      mocha.loadFilesAsync.returns(loadFilesAsyncTask.promise);

      // Act
      const onGoingAct = actMutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutantTestCoverage({ id: '42' }), mutantActivation: 'runtime' }),
      );

      // Assert
      expect(global.__stryker2__?.activeMutant).eq(undefined);
      loadFilesAsyncTask.resolve();
      await tick();
      expect(global.__stryker2__?.activeMutant).eq('42');
      expect(mocha.run).called;
      await onGoingAct;
    });

    it('should set bail to true when disableBail is false', async () => {
      const childSuite = sinon.createStubInstance(Mocha.Suite);
      mocha.suite.suites.push(childSuite);
      childSuite.suites = [];
      await actMutantRun(factory.mutantRunOptions({ disableBail: false }));
      expect(mocha.suite.bail).calledWith(true);
      expect(childSuite.bail).calledWith(true);
    });

    it('should set bail to false when disableBail is true', async () => {
      const childSuite = sinon.createStubInstance(Mocha.Suite);
      mocha.suite.suites.push(childSuite);
      childSuite.suites = [];
      await actMutantRun(factory.mutantRunOptions({ disableBail: true }));
      expect(mocha.suite.bail).calledWith(false);
      expect(childSuite.bail).calledWith(false);
    });

    it('should use `grep` to when the test filter is specified', async () => {
      await actMutantRun(factory.mutantRunOptions({ testFilter: ['foo should be bar', 'baz should be qux'] }));
      expect(mocha.grep).calledWith(new RegExp('(^foo should be bar$)|(^baz should be qux$)'));
    });

    it('should escape regex characters when filtering', async () => {
      await actMutantRun(factory.mutantRunOptions({ testFilter: ['should escape *.\\, but not /'] }));
      expect(mocha.grep).calledWith(new RegExp('(^should escape \\*\\.\\\\, but not /$)'));
    });

    it('should be able to report a killed mutant when a test fails', async () => {
      reporterMock.tests = [factory.successTestResult(), factory.failedTestResult({ id: 'foo should be bar', failureMessage: 'foo was baz' })];
      const result = await actMutantRun();
      const expectedResult: KilledMutantRunResult = {
        failureMessage: 'foo was baz',
        killedBy: ['foo should be bar'],
        status: MutantRunStatus.Killed,
        nrOfTests: 2,
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should be able report a survived mutant when all test succeed', async () => {
      reporterMock.tests = [factory.successTestResult(), factory.successTestResult()];
      const result = await actMutantRun();
      assertions.expectSurvived(result);
    });

    it('should report a timeout when the hitLimit was reached', async () => {
      reporterMock.tests = [factory.failedTestResult()];
      const result = await actMutantRun(factory.mutantRunOptions({ hitLimit: 9 }), 10);
      assertions.expectTimeout(result);
      expect(result.reason).contains('Hit limit reached (10/9)');
    });

    it('should reset the hitLimit between runs', async () => {
      reporterMock.tests = [factory.failedTestResult()];
      const firstResult = await actMutantRun(factory.mutantRunOptions({ hitLimit: 9 }), 10);
      reporterMock.tests = [factory.failedTestResult()];
      const secondResult = await actMutantRun(factory.mutantRunOptions({ hitLimit: undefined }), 10);
      assertions.expectTimeout(firstResult);
      assertions.expectKilled(secondResult);
    });

    async function actMutantRun(options = factory.mutantRunOptions(), hitCount?: number) {
      mocha.run.callsArg(0);
      const result = sut.mutantRun(options);
      global.__stryker2__!.hitCount = hitCount;
      return result;
    }
  });

  describe(MochaTestRunner.prototype.dispose.name, () => {
    let sut: MochaTestRunner;
    beforeEach(async () => {
      mochaOptionsLoaderMock.load.returns({});
      sut = createSut();
      await sut.init();
    });

    it('should dispose of mocha', async () => {
      await sut.dispose();
      expect(mocha.dispose).called;
    });
  });
});
