import { PluginKind } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { coreTokens } from '../../src/di';
import { PluginCreator } from '../../src/di/PluginCreator';
import TestFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';

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
      expect(testInjector.pluginResolver.resolve).not.called;
    });
  };

  const itShouldLogCoverageAnalysisOffOnDebug = () => {
    it('should log on debug that coverageAnalysis was "off"', () => {
      sut.determineTestFramework();
      expect(testInjector.logger.debug).calledWith(
        'The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.',
        'off'
      );
    });
  };

  const itShouldNotLogAWarningAboutTheMissingSetting = () => {
    it('should not log a warning for the missing setting', () => {
      sut.determineTestFramework();
      expect(testInjector.logger.warn).not.called;
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
        sut = createSut();
      });

      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });

    it('should retrieve the test framework if coverageAnalysis is not "off"', () => {
      const expectedTestFramework = factory.testFramework();
      pluginCreatorMock.create.returns(expectedTestFramework);
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.testFramework = 'foo';
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
        expect(testInjector.logger.warn).calledWith(
          'Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.'
        );
      });

      itShouldNotRetrieveATestFramework();
    });
    describe('and coverageAnalysis is `off`', () => {
      beforeEach(() => {
        testInjector.options.coverageAnalysis = 'off';
        sut = createSut();
      });
      itShouldNotLogAWarningAboutTheMissingSetting();
      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.pluginCreatorTestFramework, (pluginCreatorMock as unknown) as PluginCreator<PluginKind.TestFramework>)
      .injectClass(TestFrameworkOrchestrator);
  }
});
