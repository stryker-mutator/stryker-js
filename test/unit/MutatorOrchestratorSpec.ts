'use strict';

var expect = require('chai').expect;
import * as fileUtils from '../../src/utils/fileUtils';
import Mutant from '../../src/Mutant';
import MutatorOrchestrator from '../../src/MutatorOrchestrator';
require('mocha-sinon');

describe('MutatorOrchestrator', function() {
  var mutatorOrchestrator: MutatorOrchestrator;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save');

    mutatorOrchestrator = new MutatorOrchestrator();
  });

  it('should throw an error if no source files are provided', function() {
    expect(mutatorOrchestrator.mutate).to.throw(Error);
  });

  it('should return an empty array if nothing could be mutated', function() {
    this.sinon.stub(fileUtils, 'readFile', function() {
      return '';
    });

    var mutants = mutatorOrchestrator.mutate(['test.js']);

    expect(mutants.length).to.equal(0);
  });

  it('should return an array with a single mutant if only one mutant could be found in a file', function() {
    this.sinon.stub(fileUtils, 'readFile', function() {
      return 'var i = 1 + 2;';
    });

    var mutants = mutatorOrchestrator.mutate(['test.js']);

    expect(mutants.length).to.equal(1);
  });

  it('should be able to mutate code', function() {
    var originalCode = 'var i = 1 + 2;';
    var mutatedCode = 'var i = 1 - 2;';
    this.sinon.stub(fileUtils, 'readFile', function() {
      return originalCode;
    });

    var mutants = mutatorOrchestrator.mutate(['test.js']);

    expect(mutants[0].mutatedCode).to.equal(mutatedCode);
  });

  it('should set the mutated line number', function() {
    var originalCode = '\n\nvar i = 1 + 2;';
    var mutatedCode = '\n\nvar i = 1 - 2;';
    this.sinon.stub(fileUtils, 'readFile', function() {
      return originalCode;
    });

    var mutants = mutatorOrchestrator.mutate(['test.js']);

    expect(mutants[0].lineNumber).to.equal(3);
  });

  it('should not stop executing when a file does not exist', function() {
    var mutants = mutatorOrchestrator.mutate(['someFileWhichShouldNotExist.js']);

    expect(mutants.length).to.equal(0);
  });
});
