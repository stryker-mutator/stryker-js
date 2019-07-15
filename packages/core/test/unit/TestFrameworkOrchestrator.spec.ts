import TestFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { TEST_INJECTOR, factory } from '@stryker-mutator/test-helpers';
import { PluginKind } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../../src/di';
import { PluginCreator } from '../../src/di/PluginCreator';

describe('TestFrameworkOrchestrator', () => {

  let sut: TestFrameworkOrchestrator;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.TestFramework>>;

  beforeEach(() => {
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
  });

  const itShouldNotRetrieveATestFramework = () => {
    it('should not retrieve a testFramework', () => {
      const actualTestFramework = sut.determineTestFramework();
      expect(actualTestFramework).to.be.eq(null);
      expect(TEST_INJECTOR.pluginResolver.resolve).not.called;
    });
  };

  const itShouldLogCoverageAnalysisOffOnDebug = () => {
    it('should log on debug that coverageAnalysis was "off"', () => {
      sut.determineTestFramework();
      expect(TEST_INJECTOR.logger.debug).calledWith('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', 'off');
    });
  };

  const itShouldNotLogAWarningAboutTheMissingSetting = () => {
    it('should not log a warning for the missing setting', () => {
      sut.determineTestFramework();
      expect(TEST_INJECTOR.logger.warn).not.called;
    });
  };

  beforeEach(() => {
    TEST_INJECTOR.options.coverageAnalysis = 'perTest';
  });

  describe('when options contains a testFramework', () => {

    beforeEach(() => {
      TEST_INJECTOR.options.testFramework = 'fooFramework';
    });

    describe('and coverageAnalysis is explicitly "off"', () => {
      beforeEach(() => {
        TEST_INJECTOR.options.coverageAnalysis = 'off';
        sut = createSut();
      });

      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });

    it('should retrieve the test framework if coverageAnalysis is not "off"', () => {
      const expectedTestFramework = factory.testFramework();
      pluginCreatorMock.create.returns(expectedTestFramework);
      TEST_INJECTOR.options.coverageAnalysis = 'perTest';
      TEST_INJECTOR.options.testFramework = 'foo';
      sut = createSut();
      const actualTestFramework = sut.determineTestFramework();
      expect(actualTestFramework).eq(expectedTestFramework);
      expect(pluginCreatorMock.create).calledWith('foo');
    });

  });

  describe('when options does not contain a testFramework', () => {
    describe('and coverageAnalysis is not "off"', () => {

      beforeEach(() => {
        sut = createSut();
      });

      it('should log a warning for the missing setting', () => {
        sut = createSut();
        sut.determineTestFramework();
        expect(TEST_INJECTOR.logger.warn)
          .calledWith('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.');
      });

      itShouldNotRetrieveATestFramework();
    });
    describe('and coverageAnalysis is `off`', () => {

      beforeEach(() => {
        TEST_INJECTOR.options.coverageAnalysis = 'off';
        sut = createSut();
      });
      itShouldNotLogAWarningAboutTheMissingSetting();
      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });
  });

  function createSut() {
    return TEST_INJECTOR.injector
      .provideValue(coreTokens.PluginCreatorTestFramework, pluginCreatorMock as unknown as PluginCreator<PluginKind.TestFramework>)
      .injectClass(TestFrameworkOrchestrator);
  }
});
