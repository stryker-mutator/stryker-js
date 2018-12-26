import { expect } from 'chai';
import * as sinon from 'sinon';
import { StrykerOptions } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import TestFrameworkOrchestrator from '../../src/TestFrameworkOrchestrator';
import currentLogMock from '../helpers/logMock';
import { Mock } from '../helpers/producers';

describe('TestFrameworkOrchestrator', () => {

  const testFramework = 'the testFramework, \'duh';
  let log: Mock<Logger>;
  let sandbox: sinon.SinonSandbox;
  let sut: TestFrameworkOrchestrator;
  let actualTestFramework: any;
  let options: StrykerOptions;

  const actBeforeEach = () => {
    beforeEach(() => {
      log = currentLogMock();
      sut = new TestFrameworkOrchestrator(options);
      actualTestFramework = sut.determineTestFramework();
    });
  };

  const itShouldNotRetrieveATestFramework = () => {
    it('should not retrieve a testFramework', () => {
      expect(actualTestFramework).to.be.eq(null);
      expect(TestFrameworkFactory.instance().create).not.to.have.been.called;
    });
  };

  const itShouldLogCoverageAnalysisOffOnDebug = () => {
    it('should log on debug that coverageAnalysis was "off"', () =>
      expect(log.debug).to.have.been.calledWith('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', 'off'));
  };

  const itShouldNotLogAWarningAboutTheMissingSetting = () => {
    it('should not log a warning for the missing setting', () => expect(log.warn).not.to.have.been.called);
  };

  beforeEach(() => {
    options = { coverageAnalysis: 'perTest' };
    sandbox = sinon.createSandbox();
    sandbox.stub(TestFrameworkFactory.instance(), 'create').returns(testFramework);
    sandbox.stub(TestFrameworkFactory.instance(), 'knownNames').returns(['awesomeFramework', 'unusedTestFramework']);
  });

  describe('when options contains a testFramework "awesomeFramework"', () => {

    beforeEach(() => {
      options.testFramework = 'awesomeFramework';
    });

    describe('and coverageAnalysis is explicitly "off"', () => {
      beforeEach(() => {
        options.coverageAnalysis = 'off';
      });

      actBeforeEach();

      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });

  });

  describe('when options does not contain a testFramework', () => {
    describe('and coverageAnalysis is not "off"', () => {
      actBeforeEach();

      it('should log a warning for the missing setting', () => expect(log.warn).to.have.been.calledWith('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.'));

      itShouldNotRetrieveATestFramework();
    });
    describe('and coverageAnalysis is `off`', () => {

      beforeEach(() => options.coverageAnalysis = 'off');
      actBeforeEach();
      itShouldNotLogAWarningAboutTheMissingSetting();
      itShouldNotRetrieveATestFramework();
      itShouldLogCoverageAnalysisOffOnDebug();
    });
  });
  afterEach(() => {
    sandbox.restore();
  });
});
