'use strict';

var expect = require('chai').expect;
import TestRunnerFactory from '../../src/TestRunnerFactory';
import JasmineTestRunner from  '../../src/testrunners/JasmineTestRunner';

describe('TestRunnerFactory', function() {
  var testRunnerFactory;
  var config;

  beforeEach(function(){
    testRunnerFactory = new TestRunnerFactory();
    config = {
      timeoutMs: 30000
    };
  });

  describe('should throw an error', function(){
    it('when an unknown test runner is requested', function() {
      expect(function() {
        testRunnerFactory.getTestRunner('SOME UNKOWN RUNNER');
      }).to.throw(Error);
    });

    it('when no test runner name is provided', function() {
      expect(function() {
        testRunnerFactory.getTestRunner();
      }).to.throw(Error);
    });

    it('when no config is provided', function() {
      expect(function() {
        testRunnerFactory.getTestRunner('jasmine');
      }).to.throw(Error);
    });
  });

  it('should be able to return a Jasmine test runner', function() {
    var testRunner = testRunnerFactory.getTestRunner('jasmine', config);

    expect(testRunner instanceof JasmineTestRunner).to.equal(true);
  });
});
