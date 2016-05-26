var expect = require('chai').expect;
import ConsoleReporter from '../../../src/reporters/ConsoleReporter';
import MathMutator from '../../../src/mutators/MathMutator';
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

    var location: ESTree.SourceLocation = {
      start: {
        line: 1,
        column: 11
      },
      end: {
        line: 1,
        column: 12
      }
    };
    mutant = new Mutant(new MathMutator(), 'a.js', originalCode, '+', location);
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
