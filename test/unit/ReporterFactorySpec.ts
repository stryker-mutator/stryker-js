'use strict';

var expect = require('chai').expect;
import ReporterFactory from '../../src/ReporterFactory';
import ConsoleReporter from '../../src/reporters/ConsoleReporter';

describe('ReporterFactory', function() {
  var reporterFactory;

  beforeEach(function(){
    reporterFactory = new ReporterFactory();
  });

  describe('should throw an error', function() {
    it('when an unknown reporter is requested', function() {
      expect(function() {
        reporterFactory.getReporter('SOME UNKOWN REPORTER');
      }).to.throw(Error);
    });

    it('when no reporter name is provided', function() {
      expect(function() {
        reporterFactory.getReporter();
      }).to.throw(Error);
    });
  });

  it('should be able to return a console reporter', function() {
    var reporter = reporterFactory.getReporter('console');

    expect(reporter instanceof ConsoleReporter).to.equal(true);
  });
});
