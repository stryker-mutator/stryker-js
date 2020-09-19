import { expect } from 'chai';
import * as Mocha from 'mocha';
import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import sinon = require('sinon');

import { KilledMutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test_runner';

import { DirectoryRequireCache } from '@stryker-mutator/util';

import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';

import { MochaTestRunner } from '../../src/MochaTestRunner';
import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';
import { MochaAdapter } from '../../src/MochaAdapter';
import * as pluginTokens from '../../src/plugin-tokens';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { createMochaOptions } from '../helpers/factories';

describe(MochaTestRunner.name, () => {
  let directoryRequireCacheMock: sinon.SinonStubbedInstance<DirectoryRequireCache>;
  let mocha: sinon.SinonStubbedInstance<Mocha> & { suite: sinon.SinonStubbedInstance<Mocha.Suite>; dispose?: sinon.SinonStub };
  let mochaAdapterMock: sinon.SinonStubbedInstance<MochaAdapter>;
  let mochaOptionsLoaderMock: sinon.SinonStubbedInstance<MochaOptionsLoader>;
  let reporterMock: sinon.SinonStubbedInstance<StrykerMochaReporter>;

  beforeEach(() => {
    reporterMock = sinon.createStubInstance(StrykerMochaReporter);
    directoryRequireCacheMock = sinon.createStubInstance(DirectoryRequireCache);
    reporterMock.tests = [];
    mochaAdapterMock = sinon.createStubInstance(MochaAdapter);
    mochaOptionsLoaderMock = sinon.createStubInstance(MochaOptionsLoader);
    mocha = sinon.createStubInstance(Mocha) as any;
    mocha.suite = sinon.createStubInstance(Mocha.Suite) as any;
    mochaAdapterMock.create.returns(mocha);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete StrykerMochaReporter.log;
  });

  function createSut(): MochaTestRunner {
    return testInjector.injector
      .provideValue(pluginTokens.mochaAdapter, mochaAdapterMock)
      .provideValue(pluginTokens.loader, mochaOptionsLoaderMock)
      .provideValue(pluginTokens.directoryRequireCache, directoryRequireCacheMock)
      .provideValue(pluginTokens.globalNamespace, INSTRUMENTER_CONSTANTS.NAMESPACE)
      .injectClass(MochaTestRunner);
  }

  describe('constructor', () => {
    it('should set the static `log` property on StrykerMochaReporter', () => {
      createSut();
      expect(StrykerMochaReporter.log).eq(testInjector.logger);
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
      const expectedTestFileNames = ['foo.js', 'foo.spec.js'];
      const mochaOptions = Object.freeze(createMochaOptions());
      mochaOptionsLoaderMock.load.returns(mochaOptions);
      mochaAdapterMock.collectFiles.returns(expectedTestFileNames);

      await sut.init();

      expect(mochaAdapterMock.collectFiles).calledWithExactly(mochaOptions);
      expect(sut.testFileNames).eq(expectedTestFileNames);
    });

    it('should init the directory require cache', async () => {
      const expectedTestFileNames = ['foo.js', 'foo.spec.js'];
      mochaAdapterMock.collectFiles.returns(expectedTestFileNames);
      mochaOptionsLoaderMock.load.returns({});

      await sut.init();

      expect(directoryRequireCacheMock.init).calledWithExactly({
        initFiles: expectedTestFileNames,
        rootModuleId: require.resolve('mocha/lib/mocha'),
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
      mochaAdapterMock.handleRequires.returns(expectedRootHooks);

      await sut.init();

      expect(sut.rootHooks).eq(expectedRootHooks);
    });
  });

  describe(MochaTestRunner.prototype.dryRun.name, () => {
    let sut: MochaTestRunner;
    let testFileNames: string[];
    beforeEach(() => {
      testFileNames = [];
      sut = createSut();
      sut.testFileNames = testFileNames;
      sut.mochaOptions = {};
    });

    it('should pass along supported options to mocha', async () => {
      // Arrange
      testFileNames.push('foo.js', 'bar.js', 'foo2.js');
      sut.mochaOptions['async-only'] = true;
      sut.mochaOptions.grep = 'grepme';
      sut.mochaOptions.opts = 'opts';
      sut.mochaOptions.require = [];
      sut.mochaOptions.ui = 'exports';

      // Act
      await actDryRun();

      // Assert
      expect(mocha.asyncOnly).called;
      expect(mocha.ui).calledWith('exports');
      expect(mocha.grep).calledWith('grepme');
    });

    it('should force timeout off', async () => {
      await actDryRun();
      expect(mochaAdapterMock.create).calledWithMatch({ timeout: false });
    });

    it('should force bail', async () => {
      await actDryRun();
      expect(mochaAdapterMock.create).calledWithMatch({ bail: true });
    });

    it("should don't set asyncOnly if asyncOnly is false", async () => {
      sut.mochaOptions['async-only'] = false;
      await actDryRun();
      expect(mocha.asyncOnly).not.called;
    });

    it('should pass rootHooks to the mocha instance', async () => {
      const rootHooks = { beforeEach() {} };
      sut.rootHooks = rootHooks;
      await actDryRun();
      expect(mochaAdapterMock.create).calledWithMatch({ rootHooks });
    });

    it('should add collected files ', async () => {
      sut.testFileNames.push('foo.js', 'bar.js', 'foo2.js');
      await actDryRun();
      expect(mocha.addFile).calledThrice;
      expect(mocha.addFile).calledWith('foo.js');
      expect(mocha.addFile).calledWith('foo2.js');
      expect(mocha.addFile).calledWith('bar.js');
    });

    it('should add a beforeEach hook if coverage analysis is "perTest"', async () => {
      testFileNames.push('');
      await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
      expect(mocha.suite.beforeEach).calledWithMatch('StrykerIntercept', sinon.match.func);
      mocha.suite.beforeEach.callArgOnWith(1, { currentTest: { fullTitle: () => 'foo should be bar' } });
      expect(global.__stryker__?.currentTestId).eq('foo should be bar');
    });

    it('should not add a beforeEach hook if coverage analysis isn\'t "perTest"', async () => {
      testFileNames.push('');
      await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      expect(mocha.suite.beforeEach).not.called;
    });

    it('should collect mutant coverage', async () => {
      testFileNames.push('');
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = [];
      global.__stryker__!.mutantCoverage = factory.mutantCoverage({ static: { 1: 2 } });
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).deep.eq(factory.mutantCoverage({ static: { 1: 2 } }));
    });

    it('should not collect mutant coverage if coverageAnalysis is "off"', async () => {
      testFileNames.push('');
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = [];
      global.__stryker__!.mutantCoverage = factory.mutantCoverage({ static: { 1: 2 } });
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).undefined;
    });

    it('should result in the reported tests', async () => {
      testFileNames.push('');
      const expectedTests = [factory.successTestResult(), factory.failedTestResult()];
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = expectedTests;
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectCompleted(result);
      expect(result.tests).eq(expectedTests);
    });

    it("should result an error if the StrykerMochaReporter isn't set correctly", async () => {
      testFileNames.push('');
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectErrored(result);
      expect(result.errorMessage).eq("Mocha didn't instantiate the StrykerMochaReporter correctly. Test result cannot be reported.");
    });

    it('should collect and purge the requireCache between runs', async () => {
      // Arrange
      testFileNames.push('');

      // Act
      await actDryRun(factory.dryRunOptions());

      // Assert
      expect(directoryRequireCacheMock.clear).called;
      expect(directoryRequireCacheMock.record).called;
      expect(directoryRequireCacheMock.clear).calledBefore(directoryRequireCacheMock.record);
    });

    it('should dispose of mocha when it supports it', async () => {
      mocha.dispose = sinon.stub();
      await actDryRun();
      expect(mocha.dispose).called;
    });

    async function actDryRun(options = factory.dryRunOptions()) {
      mocha.run.onFirstCall().callsArg(0);
      return sut.dryRun(options);
    }
  });

  describe(MochaTestRunner.prototype.mutantRun.name, () => {
    let sut: MochaTestRunner;
    beforeEach(() => {
      sut = createSut();
      sut.testFileNames = [];
      sut.mochaOptions = {};
      StrykerMochaReporter.currentInstance = reporterMock;
    });

    it('should active the given mutant', async () => {
      await actMutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 42 }) }));
      expect(global.__stryker__?.activeMutant).eq(42);
    });

    it('should use `grep` to when the test filter is specified', async () => {
      await actMutantRun(factory.mutantRunOptions({ testFilter: ['foo should be bar', 'baz should be qux'] }));
      expect(mocha.grep).calledWith(new RegExp('(foo should be bar)|(baz should be qux)'));
    });

    it('should escape regex characters when filtering', async () => {
      await actMutantRun(factory.mutantRunOptions({ testFilter: ['should escape *.\\, but not /'] }));
      expect(mocha.grep).calledWith(new RegExp('(should escape \\*\\.\\\\, but not /)'));
    });

    it('should be able to report a killed mutant when a test fails', async () => {
      reporterMock.tests = [factory.successTestResult(), factory.failedTestResult({ id: 'foo should be bar', failureMessage: 'foo was baz' })];
      const result = await actMutantRun();
      const expectedResult: KilledMutantRunResult = {
        failureMessage: 'foo was baz',
        killedBy: 'foo should be bar',
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

    async function actMutantRun(options = factory.mutantRunOptions()) {
      mocha.run.callsArg(0);
      return sut.mutantRun(options);
    }
  });
});
