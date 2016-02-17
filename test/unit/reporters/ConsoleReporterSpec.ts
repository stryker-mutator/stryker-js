'use strict';

var expect = require('chai').expect;
import ConsoleReporter from '../../../src/reporters/ConsoleReporter';
var MathMutation = require('../../../src/mutations/MathMutation');
var Mutant = require('../../../src/Mutant');
var ParserUtils = require('../../../src/utils/ParserUtils');
require('mocha-sinon');

describe('ConsoleReporter', function() {
  var consoleReporter;
  var mutant;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save');
    var log = console.log;
    this.sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });

    var originalCode = "var i = 1 - 1;";
    var mutatedCode = "var i = 1 + 1;";
    var parserUtils = new ParserUtils();
    var ast = parserUtils.parse(mutatedCode);
    consoleReporter = new ConsoleReporter();
    mutant = new Mutant('a.js', originalCode, new MathMutation(), ast, ast.body[0].declarations[0].init, 1);
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
