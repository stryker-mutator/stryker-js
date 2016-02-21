'use strict';

var expect = require('chai').expect;
import Mutant from '../../src/Mutant';
import MathMutation from '../../src/mutations/MathMutation';
import ParserUtils from '../../src/utils/ParserUtils';
require('mocha-sinon');

describe('Mutant', function() {
  var mutant;
  var filename;
  var mutation;
  var originalLine;
  var originalCode;
  var mutatedLine;
  var mutatedCode;
  var lineNumber;
  var ast;
  var node;

  beforeEach(function() {
    this.sinon.stub(Mutant.prototype, 'save', function(){
      this._mutatedFilename = 'mutatedSrc.js';
    });
    var parserUtils = new ParserUtils();

    var baseCode = 'var i = 1 + 2;\n';
    originalLine = 'var j = i * 2;';
    mutatedLine = 'var j = i / 2;';
    originalCode = baseCode + originalLine;
    mutatedCode = baseCode + mutatedLine;
    lineNumber = 2;

    filename = 'something.js';
    mutation = new MathMutation();
    ast = parserUtils.parse(mutatedCode);
    node = ast.body[1].declarations[0].init;

    mutant = new Mutant(filename, originalCode, mutation, ast, node, 11);
  });

  describe('should set', function() {
    it('the filename', function() {
      expect(mutant.getFilename()).to.equal(filename);
    });

    it('the mutation', function() {
      expect(mutant.getMutation()).to.equal(mutation);
    });

    it('the mutated code', function() {
      expect(mutant.getMutatedCode()).to.equal(mutatedCode);
    });

    it('the line number', function() {
      expect(mutant.getLineNumber()).to.equal(lineNumber);
    });

    it('the column number', function() {
      expect(mutant.getColumnNumber()).to.equal(11);
    });

    it('the original line of code', function() {
      expect(mutant.getOriginalLine()).to.equal(originalLine);
    });

    it('the mutated line of code', function() {
      expect(mutant.getMutatedLine()).to.equal(mutatedLine);
    });
  });

  it('should default to the status untested', function() {
    expect(mutant.hasStatusUntested()).to.equal(true);
  });

  it('should be capable of setting the status to survived', function() {
    mutant.setStatusSurvived();

    expect(mutant.hasStatusSurvived()).to.equal(true);
  });

  it('should be capable of setting the status to killed', function() {
    mutant.setStatusKilled();

    expect(mutant.hasStatusKilled()).to.equal(true);
  });

  it('should be capable of setting the status to untested', function() {
    mutant.setStatusKilled();
    mutant.setStatusUntested();

    expect(mutant.hasStatusUntested()).to.equal(true);
  });

  it('should be capable of setting the status to timed out', function() {
    mutant.setStatusTimedOut();

    expect(mutant.hasStatusTimedOut()).to.equal(true);
  });

  describe('should throw an error', function() {
    it('if no sourceFiles are provided to insertMutatedFile', function() {
      expect(mutant.insertMutatedFile).to.throw(Error);
    });
  });

  describe('should be able to insert a mutated file', function(){
    it('without changing the original array of source files', function(){
      var sourceFiles = ['sample.js', mutant.getMutatedFilename(), 'somethingElse.js'];
      var sourceFilesBackup = sourceFiles.slice(0);

      var mutatedSourceFiles = mutant.insertMutatedFile(sourceFiles);

      expect(sourceFiles).to.deep.equal(sourceFilesBackup);
    });

    it('and replace the original filename with the mutated filename', function(){
      var sourceFiles = ['sample.js', mutant.getMutatedFilename(), 'somethingElse.js'];

      var mutatedSourceFiles = mutant.insertMutatedFile(sourceFiles);

      expect(mutatedSourceFiles[1]).to.equal(mutant.getMutatedFilename());
    });
  });
});
