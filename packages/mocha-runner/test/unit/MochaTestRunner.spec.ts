import { expect } from 'chai';
import * as Mocha from 'mocha';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import sinon = require('sinon');

import { MochaTestRunner } from '../../src/MochaTestRunner';
import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';
import { MochaAdapter } from '../../src/MochaAdapter';
import * as pluginTokens from '../../src/plugin-tokens';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { createMochaOptions } from '../helpers/factories';

describe.only(MochaTestRunner.name, () => {
  let mocha: sinon.SinonStubbedInstance<Mocha> & { suite: sinon.SinonStubbedInstance<Mocha.Suite> };
  let mochaAdapterMock: sinon.SinonStubbedInstance<MochaAdapter>;
  let mochaOptionsLoaderMock: sinon.SinonStubbedInstance<MochaOptionsLoader>;
  let sandboxFileNames: string[];
  let reporterMock: sinon.SinonStubbedInstance<StrykerMochaReporter>;

  beforeEach(() => {
    sandboxFileNames = [];
    reporterMock = sinon.createStubInstance(StrykerMochaReporter);
    mochaAdapterMock = sinon.createStubInstance(MochaAdapter);
    mochaOptionsLoaderMock = sinon.createStubInstance(MochaOptionsLoader);
    mocha = sinon.createStubInstance(Mocha) as any;
    mocha.suite = sinon.createStubInstance(Mocha.Suite) as any;
    mochaAdapterMock.create.returns(mocha);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete require.cache['baz.js'];
    delete StrykerMochaReporter.log;
  });

  function createSut(): MochaTestRunner {
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, sandboxFileNames)
      .provideValue(pluginTokens.mochaAdapter, mochaAdapterMock)
      .provideValue(pluginTokens.loader, mochaOptionsLoaderMock)
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
      const mochaOptions = Object.freeze(createMochaOptions({ timeout: 23 }));
      mochaOptionsLoaderMock.load.returns(mochaOptions);
      mochaAdapterMock.collectFiles.returns(expectedTestFileNames);

      await sut.init();

      expect(mochaAdapterMock.collectFiles).calledWithExactly(mochaOptions);
      expect(sut.testFileNames).eq(expectedTestFileNames);
    });

    it('should not handle requires when there are not requires', async () => {
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
      sut.mochaOptions.timeout = 2000;
      sut.mochaOptions.ui = 'exports';

      // Act
      await actDryRun();

      // Assert
      expect(mocha.asyncOnly).called;
      expect(mocha.timeout).calledWith(2000);
      expect(mocha.ui).calledWith('exports');
      expect(mocha.grep).calledWith('grepme');
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
      expect(global.__currentTestId__).eq('foo should be bar');
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
      global.__mutantCoverage__ = factory.mutantCoverage({ static: { 1: 2 } });
      const result = await actDryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).deep.eq(factory.mutantCoverage({ static: { 1: 2 } }));
    });

    it('should not collect mutant coverage if coverageAnalysis is "off"', async () => {
      testFileNames.push('');
      StrykerMochaReporter.currentInstance = reporterMock;
      reporterMock.tests = [];
      global.__mutantCoverage__ = factory.mutantCoverage({ static: { 1: 2 } });
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

    it('should purge cached sandbox files', async () => {
      // Arrange
      sandboxFileNames.push('foo.js', 'bar.js');
      testFileNames.push('foo.js'); // should still purge 'bar.js'
      require.cache['foo.js'] = 'foo' as any;
      require.cache['bar.js'] = 'bar' as any;
      require.cache['baz.js'] = 'baz' as any;

      // Act
      await actDryRun();

      // Assert
      expect(require.cache['foo.js']).undefined;
      expect(require.cache['bar.js']).undefined;
      expect(require.cache['baz.js']).eq('baz');
    });

    async function actDryRun(options = factory.dryRunOptions()) {
      mocha.run.callsArg(0);
      return sut.dryRun(options);
    }
  });
});
