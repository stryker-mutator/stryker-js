'use strict';

var expect = require('chai').expect;
import Mutant, {MutantStatus} from '../../src/Mutant';
import MathMutation from '../../src/mutations/MathMutation';
import ParserUtils from '../../src/utils/ParserUtils';
require('mocha-sinon');

describe('Mutant', function() {
  var mutant: Mutant;
  var filename: string;
  var mutation: MathMutation;
  var originalLine: string;
  var originalCode: string;
  var mutatedLine: string;
  var mutatedCode: string;
  var lineNumber: number;
  var ast: ESTree.Program;
  var node: ESTree.Node;

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
    node = (<ESTree.VariableDeclaration>ast.body[1]).declarations[0].init;

    mutant = new Mutant(filename, originalCode, mutation, ast, node, 11);
  });

  describe('should set', function() {
    it('the filename', function() {
      expect(mutant.filename).to.equal(filename);
    });

    it('the mutation', function() {
      expect(mutant.mutation).to.equal(mutation);
    });

    it('the mutated code', function() {
      expect(mutant.mutatedCode).to.equal(mutatedCode);
    });

    it('the line number', function() {
      expect(mutant.lineNumber).to.equal(lineNumber);
    });

    it('the column number', function() {
      expect(mutant.columnNumber).to.equal(11);
    });

    it('the original line of code', function() {
      expect(mutant.originalLine).to.equal(originalLine);
    });

    it('the mutated line of code', function() {
      expect(mutant.mutatedLine).to.equal(mutatedLine);
    });
  });

  it('should default to the status untested', function() {
    expect(mutant.status).to.equal(MutantStatus.UNTESTED);
  });

  describe('should throw an error', function() {
    it('if no sourceFiles are provided to insertMutatedFile', function() {
      expect(mutant.insertMutatedFile).to.throw(Error);
    });
  });

  describe('should be able to insert a mutated file', function(){
    it('without changing the original array of source files', function(){
      var sourceFiles = ['sample.js', mutant.mutatedFilename, 'somethingElse.js'];
      var sourceFilesBackup = sourceFiles.slice(0);

      var mutatedSourceFiles = mutant.insertMutatedFile(sourceFiles);

      expect(sourceFiles).to.deep.equal(sourceFilesBackup);
    });

    it('and replace the original filename with the mutated filename', function(){
      var sourceFiles = ['sample.js', mutant.mutatedFilename, 'somethingElse.js'];

      var mutatedSourceFiles = mutant.insertMutatedFile(sourceFiles);

      expect(mutatedSourceFiles[1]).to.equal(mutant.mutatedFilename);
    });
  });
});
