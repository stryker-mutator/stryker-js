'use strict';

var expect = require('chai').expect;
import BaseTestRunner from '../../../src/testrunners/BaseTestRunner';

describe('BaseTestRunner', function() {
  class MockTestRunner extends BaseTestRunner {}
  
  var testRunner: BaseTestRunner;
  beforeEach(function() {
    testRunner = new MockTestRunner({});
    testRunner.setBaseTimeout(0);
    testRunner.setTimeoutMs(0);
    testRunner.setTimeoutFactor(1.0);
  });

  describe('should set the total timeout', function() {
    it('when the base timeout is set', function() {
      var timeout = 3000;

      testRunner.setBaseTimeout(timeout);
      var totalTimeout = testRunner.getTotalTimeout();

      expect(totalTimeout).to.equal(timeout);
    });

    it('when the timeout ms is set', function() {
      var timeout = 3000;

      testRunner.setTimeoutMs(timeout);
      var totalTimeout = testRunner.getTotalTimeout();

      expect(totalTimeout).to.equal(timeout);
    });

    it('when the timeout factor is set', function() {
      var timeout = 1000;
      var timeoutMs = 5000;
      var timeoutFactor = 2.0;
      testRunner.setBaseTimeout(timeout);
      testRunner.setTimeoutMs(timeout);
      var expectedTotalTimeout = testRunner.getTotalTimeout() * timeoutFactor;

      testRunner.setTimeoutFactor(timeoutFactor);
      var totalTimeout = testRunner.getTotalTimeout();

      expect(totalTimeout).to.equal(expectedTotalTimeout);
    });
  });
});
