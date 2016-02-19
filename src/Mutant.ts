'use strict';

var _ = require('lodash');
import BaseMutation from './mutations/BaseMutation';
import FileUtils from './utils/FileUtils';
var ParserUtils = require('./utils/ParserUtils');
var TypeUtils = require('./utils/TypeUtils');

/**
 * Represents a mutation which has been applied to a file.
 * @constructor
 * @param {String} filename - The name of the file which was mutated, including the path.
 * @param {String} originalCode - The original content of the file which has not been mutated.
 * @param {Object} mutation - The mutation which was applied to this Mutant.
 * @param {Object} ast - The abstract syntax tree of the file.
 * @param {Object} node - The part of the ast which has been mutated.
 * @param {Number} columnNumber - The column which has been mutated.
 */
function Mutant(filename, originalCode, mutation, ast, node, columnNumber) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterString(filename, 'Mutant', 'filename');
  this._typeUtils.expectParameterString(originalCode, 'Mutant', 'originalCode');
  this._typeUtils.expectParameterObject(mutation, 'Mutant', 'mutation');
  this._typeUtils.expectParameterObject(ast, 'Mutant', 'ast');
  this._typeUtils.expectParameterObject(node, 'Mutant', 'node');
  this._typeUtils.expectParameterNumber(columnNumber, 'Mutant', 'columnNumber');

  var parserUtils = new ParserUtils();

  this._filename = filename;
  this._mutation = mutation;
  this._mutatedCode = parserUtils.generate(ast, originalCode);
  this._lineNumber = node.loc.start.line;
  this._columnNumber = columnNumber;
  this.setStatusUntested();
  this._testsRan = [];
  this._mutatedLine = _.trim(this._mutatedCode.split('\n')[this._lineNumber - 1]);
  this._originalLine = _.trim(originalCode.split('\n')[this._lineNumber - 1]);
  this._fileUtils = new FileUtils();
  this.save();
}

/**
 * Inserts the mutated file into an array of source files. The original array is not altered in the process.
 * @function
 * @param {String[]} sourceFiles - The list of source files of which one has to be replaced with the mutated file.
 * @returns {String[]} The list of source files of which one source file has been replaced.
 */
Mutant.prototype.insertMutatedFile = function(sourceFiles) {
  this._typeUtils.expectParameterArray(sourceFiles, 'Mutant', 'sourceFiles');
  var mutatedSrc = _.clone(sourceFiles);
  var mutantSourceFileIndex = _.indexOf(mutatedSrc, this.getFilename());
  mutatedSrc[mutantSourceFileIndex] = this.getMutatedFilename();
  return mutatedSrc;
};

/**
 * The status of an untested Mutant.
 * @static
 */
Mutant.UNTESTED = 'UNTESTED';

/**
 * The status of a killed Mutant.
 * @static
 */
Mutant.KILLED = 'KILLED';

/**
 * The status of a survived Mutant.
 * @static
 */
Mutant.SURVIVED = 'SURVIVED';

/**
 * The status of a timed out Mutant.
 * @static
 */
Mutant.TIMEDOUT = 'TIMEDOUT';

/**
 * Gets the name of the file which has been mutated.
 * @function
 * @returns {String} The name of the mutated file.
 */
Mutant.prototype.getFilename = function() {
  return this._filename;
};

/**
 * Gets if the Mutant has the status KILLED.
 * @function
 * @returns {Boolean} True if the Mutant has the status KILLED.
 */
Mutant.prototype.hasStatusKilled = function() {
  return this.getStatus() === Mutant.KILLED;
};

/**
 * Sets the status of the Mutant to KILLED.
 * @function
 */
Mutant.prototype.setStatusKilled = function() {
  this.setStatus(Mutant.KILLED);
};

/**
 * Gets if the Mutant has the status UNTESTED.
 * @function
 * @returns {Boolean} True if the Mutant has the status UNTESTED.
 */
Mutant.prototype.hasStatusUntested = function() {
  return this.getStatus() === Mutant.UNTESTED;
};

/**
 * Sets the status of the Mutant to UNTESTED.
 * @function
 */
Mutant.prototype.setStatusUntested = function() {
  this.setStatus(Mutant.UNTESTED);
};

/**
 * Gets if the Mutant has the status SURVIVED.
 * @function
 * @returns {Boolean} True if the Mutant has the status SURVIVED.
 */
Mutant.prototype.hasStatusSurvived = function() {
  return this.getStatus() === Mutant.SURVIVED;
};

/**
 * Sets the status of the Mutant to SURVIVED.
 * @function
 */
Mutant.prototype.setStatusSurvived = function() {
  this.setStatus(Mutant.SURVIVED);
};

/**
 * Gets if the Mutant has the status TIMEDOUT.
 * @function
 * @returns {Boolean} True if the Mutant has the status TIMEDOUT.
 */
Mutant.prototype.hasStatusTimedOut = function() {
  return this.getStatus() === Mutant.TIMEDOUT;
};

/**
 * Sets the status of the Mutant to TIMEDOUT.
 * @function
 */
Mutant.prototype.setStatusTimedOut = function() {
  this.setStatus(Mutant.TIMEDOUT);
};


/**
 * Gets the Mutation which has been applied.
 * @function
 * @returns {Mutation} The applied Mutation.
 */
Mutant.prototype.getMutation = function() {
  return this._mutation;
};

/**
 * Gets the source code which contains a mutation.
 * @function
 * @returns {String} The code containing a mutation.
 */
Mutant.prototype.getMutatedCode = function() {
  return this._mutatedCode;
};

/**
 * Gets the original line of code.
 * @function
 * @returns {String} The original line of code.
 */
Mutant.prototype.getOriginalLine = function() {
  return this._originalLine;
};

/**
 * Gets the mutated line of code.
 * @function
 * @returns {String} The mutated line of code.
 */
Mutant.prototype.getMutatedLine = function() {
  return this._mutatedLine;
};

/**
 * Gets the status of the Mutant.
 * @function
 * @returns {String} The status.
 */
Mutant.prototype.getStatus = function() {
  return this._status;
};

/**
 * Sets the status of the Mutant.
 * @function
 * @param {String} status - The new status.
 */
Mutant.prototype.setStatus = function(status) {
  this._typeUtils.expectParameterString(status, 'Mutant', 'status');

  this._status = status;
};

/**
 * Gets the line number at which the mutation was applied in the original file.
 * @function
 * @returns {Number} The line number.
 */
Mutant.prototype.getLineNumber = function() {
  return this._lineNumber;
};

/**
 * Gets the column number at which the mutation was applied in the original file.
 * @function
 * @returns {Number} The column number.
 */
Mutant.prototype.getColumnNumber = function() {
  return this._columnNumber;
};

/**
 * Sets the tests which were ran on this Mutant.
 * @function
 * @param {String[]} tests - The array of tests which were ran.
 */
Mutant.prototype.setTestsRan = function(tests) {
  this._typeUtils.expectParameterArray(tests, 'Mutant', 'tests');

  this._testsRan = tests;
};

/**
 * Gets the tests which were ran on this Mutant.
 * @function
 * @returns The array of tests which were ran.
 */
Mutant.prototype.getTestsRan = function() {
  return this._testsRan;
};

/**
 * Gets the name and path of the mutated file.
 * @function
 * @returns The name and path of the mutated file.
 */
Mutant.prototype.getMutatedFilename = function() {
  return this._mutatedFilename;
};

/**
 * Saves the mutated code in a mutated file.
 * @function
 */
Mutant.prototype.save = function() {
  this._mutatedFilename = this._fileUtils.createFileInTempFolder(this._filename, this._mutatedCode);
};

/**
 * Removes the mutated file.
 * @function
 */
Mutant.prototype.remove = function() {
  this._fileUtils.removeTempFile(this._mutatedFilename);
};

module.exports = Mutant;
