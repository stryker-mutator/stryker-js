'use strict';

var expect = require('chai').expect;
import JasmineTestRunner from '../../../src/testrunners/JasmineTestRunner';
import TestFile from '../../../src/TestFile';
import {ConfigOptionsIncludingCoverage} from '../../../src/testrunners/KarmaTestRunner'
require('mocha-sinon');

describe('JasmineTestRunner', function() {
  var config: ConfigOptionsIncludingCoverage;
  var jasmine: JasmineTestRunner;

  beforeEach(function() {
    config = {
      port: 9876,
      browsers: ['PhantomJS'],
      singleRun: true,
      libs: []
    };
    jasmine = new JasmineTestRunner(config);
    jasmine.setBaseTimeout(10000);
    this.sinon.stub(TestFile.prototype, 'save', function() {
      return this.name;
    });
  });

  describe('should throw an error', function() {
    it('when no options are provided', function() {
      expect(JasmineTestRunner).to.throw(Error);
    });
  });

  describe('should cause a time-out', function() {
    it('when a test took too long', function(done) {
      this.timeout(10000);

      jasmine.setBaseTimeout(0);
      jasmine.setTimeoutMs(1);
      jasmine.setTimeoutFactor(1.0);

      jasmine.test(config, ['test/sampleProject/src/InfiniteAdd.js'], [new TestFile('test/sampleProject/test/AddSpec.js', '// Dummy code')], function(result) {
        expect(result.getTimedOut()).to.equal(true);
        done();
      });
    });
  });

  it('should let passing tests pass', function(done) {
    this.timeout(10000);

    jasmine.test(config, ['test/sampleProject/src/Add.js'], [new TestFile('test/sampleProject/test/AddSpec.js', '// Dummy code')], function(result) {
      expect(result.getAllTestsSuccessful()).to.equal(true);
      done();
    });
  });


  it('should indicate an error has occurred if one of the tests fails', function(done) {
    this.timeout(10000);

    jasmine.test(config, ['test/sampleProject/src/Add.js'], [new TestFile('test/sampleProject/test/AddSpec.js', '// Dummy code'), new TestFile('test/sampleProject/test/FailingAddSpec.js', '// Dummy code')], function(result) {
      expect(result.getAllTestsSuccessful()).to.equal(false);
      done();
    });
  });
});
