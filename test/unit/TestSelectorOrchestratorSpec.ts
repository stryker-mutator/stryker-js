import TestSelectorOrchestrator from '../../src/TestSelectorOrchestrator';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {TestSelectorFactory} from 'stryker-api/test_selector';
import {StrykerOptions} from 'stryker-api/core';
import logger from '../helpers/log4jsMock';

describe('TestSelectorOrchestrator', () => {

  let testSelector = 'the testSelector, \'duh';
  let sandbox: sinon.SinonSandbox;
  let sut: TestSelectorOrchestrator;
  let actualTestSelector: any;
  let options: StrykerOptions;

  let actBeforeEach = () => {
    beforeEach(() => {
      sut = new TestSelectorOrchestrator(options);
      actualTestSelector = sut.determineTestSelector();
    });
  };

  let itShouldRetrieveTheTestSelector = () => {
    it('should retrieve the test selector', () => expect(actualTestSelector).to.be.eq(testSelector));
  };

  let itShouldUseTheValueOf = (expectedTestSelectorName: string) => {
    it(`should use the value of "${expectedTestSelectorName}"`, () => expect(TestSelectorFactory.instance().create).to.have.been.calledWith(expectedTestSelectorName, { options }));
  };

  let itShouldNotRetrieveATestSelector = () => {
    it('should not retrieve a testSelector', () => {
      expect(actualTestSelector).to.be.eq(null);
      expect(TestSelectorFactory.instance().create).not.to.have.been.called;
    });
  };

  let itShouldNotLogAWarningAboutTheMissingSetting = () => {
    it('should not log a warning for the missing setting', () => expect(logger.warn).not.to.have.been.called);
  };

  beforeEach(() => {
    options = {};
    sandbox = sinon.sandbox.create();
    sandbox.stub(TestSelectorFactory.instance(), 'create').returns(testSelector);
    sandbox.stub(TestSelectorFactory.instance(), 'knownNames').returns(['awesomeFramework', 'overrideTestSelector']);
  });

  describe('when options contains a testFramework "awesomeFramework"', () => {

    beforeEach(() => {
      options.testFramework = 'awesomeFramework';
    });

    describe('and testSelector is not defined', () => {
      actBeforeEach();
      itShouldRetrieveTheTestSelector();
      itShouldUseTheValueOf('awesomeFramework');
    });

    describe('and testSelector is explicitly null', () => {
      beforeEach(() => {
        options.testSelector = null;
      });

      actBeforeEach();

      itShouldNotRetrieveATestSelector();
    });

    describe('and testSelector is "overrideTestSelector"', () => {
      beforeEach(() => {
        options.testSelector = 'overrideTestSelector';
      });

      actBeforeEach();

      itShouldRetrieveTheTestSelector();
      itShouldUseTheValueOf('overrideTestSelector');
    });
  });

  describe('when options does not contain a testFramework', () => {
    describe('and testSelector is not set', () => {
      actBeforeEach();

      it('should log a warning for the missing setting', () => expect(logger.warn).to.have.been.calledWith('Missing config settings `testFramework` or `testSelector`. Stryker will continue without the ability to select individual tests. Set `testSelector` option explicitly to `null` to ignore this warning.'));

      itShouldNotRetrieveATestSelector();
    });
    describe('and testSelector is `null`', () => {

      beforeEach(() => options.testSelector = null);
      actBeforeEach();
      itShouldNotLogAWarningAboutTheMissingSetting();
      itShouldNotRetrieveATestSelector();
    });
    describe('and testSelector is set to "overrideTestSelector"', () => {
      beforeEach(() => options.testSelector = 'overrideTestSelector');
      actBeforeEach();
      itShouldUseTheValueOf('overrideTestSelector');
      itShouldRetrieveTheTestSelector();
    });
    describe('and testSelector is set to "thisTestSelectorDoesNotExist"', () => {
      beforeEach(() => options.testSelector = 'thisTestSelectorDoesNotExist');
      actBeforeEach();
      it('should log a warning and retrieve `null`', () => {
        expect(actualTestSelector).to.be.eq(null);
        expect(logger.warn).to.have.been.calledWith('Could not find test selector `thisTestSelectorDoesNotExist`. Stryker will continue without the ability to select individual tests. Did you forget to load a plugin? Known test selectors: ["awesomeFramework","overrideTestSelector"].')
      });
    });

    describe('testFramework is set to "testFrameworkWithoutSelector"', () => {
      beforeEach(() => options.testFramework = 'testFrameworkWithoutSelector');
      actBeforeEach();
      it('should log a warning and retrieve `null`', () => {
        expect(actualTestSelector).to.be.eq(null);
        expect(logger.warn).to.have.been.calledWith('Could not find test selector `testFrameworkWithoutSelector` (based on the configured testFramework). Stryker will continue without the ability to select individual tests. Set `testSelector` option explicitly to `null` to ignore this warning. Did you forget to load a plugin? Known test selectors: ["awesomeFramework","overrideTestSelector"].')
      });
    });
  });
  afterEach(() => {
    sandbox.restore();
  });
});