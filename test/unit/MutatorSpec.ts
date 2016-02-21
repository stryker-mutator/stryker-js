'use strict';

var expect = require('chai').expect;
import FileUtils from '../../src/utils/FileUtils';
import Mutant from '../../src/Mutant';
import Mutator from '../../src/Mutator';
require('mocha-sinon');

describe('Mutator', function() {
  var mutator;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save');

    mutator = new Mutator();
  });

  it('should throw an error if no source files are provided', function() {
    expect(mutator.mutate).to.throw(Error);
  });

  it('should return an empty array if nothing could be mutated', function() {
    this.sinon.stub(FileUtils.prototype, 'readFile', function() {
      return '';
    });

    var mutants = mutator.mutate(['test.js']);

    expect(mutants.length).to.equal(0);
  });

  it('should return an array with a single mutant if only one mutant could be found in a file', function() {
    this.sinon.stub(FileUtils.prototype, 'readFile', function() {
      return 'var i = 1 + 2;';
    });

    var mutants = mutator.mutate(['test.js']);

    expect(mutants.length).to.equal(1);
  });

  it('should be able to mutate code', function() {
    var originalCode = 'var i = 1 + 2;';
    var mutatedCode = 'var i = 1 - 2;';
    this.sinon.stub(FileUtils.prototype, 'readFile', function() {
      return originalCode;
    });

    var mutants = mutator.mutate(['test.js']);

    expect(mutants[0].getMutatedCode()).to.equal(mutatedCode);
  });

  it('should set the mutated line number', function() {
    var originalCode = '\n\nvar i = 1 + 2;';
    var mutatedCode = '\n\nvar i = 1 - 2;';
    this.sinon.stub(FileUtils.prototype, 'readFile', function() {
      return originalCode;
    });

    var mutants = mutator.mutate(['test.js']);

    expect(mutants[0].getLineNumber()).to.equal(3);
  });

  it('should not stop executing when a file does not exist', function() {
    var mutants = mutator.mutate(['someFileWhichShouldNotExist.js']);

    expect(mutants.length).to.equal(0);
  });
});
