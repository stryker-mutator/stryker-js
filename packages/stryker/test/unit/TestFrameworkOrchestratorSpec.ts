import TestFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { TestFramework } from 'stryker-api/test_framework';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { PluginKind } from 'stryker-api/plugin';

describe('TestFrameworkOrchestrator', () => {

  let sut: TestFrameworkOrchestrator;
  let actualTestFramework: TestFramework | null;

  const actBeforeEach = () => {
    beforeEach(() => {
      sut = testInjector.injector.injectClass(TestFrameworkOrchestrator);
      actualTestFramework = sut.determineTestFramework();
    });
  };

  const itShouldNotRetrieveATestFramework = () => {
    it('should not retrieve a testFramework', () => {
      expect(actualTestFramework).to.be.eq(null);
      expect(testInjector.pluginResolver.resolve).not.called;
    });
  };

  const itShouldLogCoverageAnalysisOffOnDebug = () => {
    it('should log on debug that coverageAnalysis was "off"', () =>
      expect(testInjector.logger.debug).to.have.been.calledWith('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', 'off'));
  };

  const itShouldNotLogAWarningAboutTheMissingSetting = () => {
    it('should not log a warning for the missing setting', () => {
      expect(testInjector.logger.warn).not.to.have.been.called;
    });
  };

  beforeEach(() => {
    testInjector.options.coverageAnalysis = 'perTest';
  });

  describe('when options contains a testFramework', () => {

    beforeEach(() => {
      testInjector.options.testFramework = 'fooFramework';
    });

    describe('and coverageAnalysis is explicitly "off"', () => {
      beforeEach(() => {
        testInjector.options.coverageAnalysis = 'off';
      });

      actBeforeEach();

      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });

    it('should retrieve the test framework if coverageAnalysis is not "off"', () => {
      const fooFrameworkPlugin = mockTestFrameworkPlugin('fooTestFramework');
      testInjector.pluginResolver.resolve
        .withArgs(PluginKind.TestFramework, fooFrameworkPlugin.name)
        .returns(fooFrameworkPlugin);
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.testFramework = fooFrameworkPlugin.name;
      sut = testInjector.injector.injectClass(TestFrameworkOrchestrator);
      const actualTestFramework = sut.determineTestFramework();
      expect(actualTestFramework).eq(fooFrameworkPlugin.testFrameworkStub);
    });

  });

  describe('when options does not contain a testFramework', () => {
    describe('and coverageAnalysis is not "off"', () => {

      actBeforeEach();

      it('should log a warning for the missing setting', () => {
        sut = testInjector.injector.injectClass(TestFrameworkOrchestrator);
        actualTestFramework = sut.determineTestFramework();
        expect(testInjector.logger.warn)
          .calledWith('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.');
      });

      itShouldNotRetrieveATestFramework();
    });
    describe('and coverageAnalysis is `off`', () => {

      beforeEach(() => testInjector.options.coverageAnalysis = 'off');
      actBeforeEach();
      itShouldNotLogAWarningAboutTheMissingSetting();
      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });
  });

  type MockTestFrameworkPlugin = TestFrameworkPlugin & { testFrameworkStub: TestFramework };

  interface TestFrameworkPlugin {
    kind: PluginKind.TestFramework;
    factory: sinon.SinonStub;
    name: string;
    testFrameworkStub: TestFramework;
  }

  function mockTestFrameworkPlugin(name: string): MockTestFrameworkPlugin {
    const configEditorPlugin: TestFrameworkPlugin = {
      factory: sinon.stub(),
      kind: PluginKind.TestFramework,
      name,
      testFrameworkStub: factory.testFramework()
    };
    configEditorPlugin.factory.returns(configEditorPlugin.testFrameworkStub);
    return configEditorPlugin;
  }

});
