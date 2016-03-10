'use strict';

var expect = require('chai').expect;
import ConsoleReporter from '../../../src/reporters/ConsoleReporter';
import MathMutation from '../../../src/mutations/MathMutation';
import Mutant from '../../../src/Mutant';
require('mocha-sinon');

describe('ConsoleReporter', function() {
  var consoleReporter: ConsoleReporter;
  var mutant: Mutant;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save');
    var log = console.log;
    this.sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });

    var originalCode = "var i = 1 - 1;";
    var mutatedCode = "var i = 1 + 1;";
    consoleReporter = new ConsoleReporter();
    var location = {
      mutatedCol: 11,
      startCol: 9,
      endCol: 13,
      startLine: 1,
      endLine: 1
    };
    mutant = new Mutant(new MathMutation(), 'a.js', originalCode, '1 + 1', location);
  });
  
  
/*
  it('should log the mutant if it has the correct status', function() {
    mutant.setStatusSurvived();
    consoleReporter.mutantTested(mutant);

    expect(console.log.called).to.equal(true);
  });

  it('should not log the mutant if it has the wrong status', function() {
    consoleReporter.mutantTested(mutant);

    expect(console.log.called).to.equal(false);
  });
  */
});
