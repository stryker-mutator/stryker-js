'use strict';

var _ = require('lodash');
import BaseMutation from './mutations/BaseMutation';
import FileUtils from './utils/FileUtils';
import ParserUtils from './utils/ParserUtils';
import TypeUtils from './utils/TypeUtils';
import TestFile from './TestFile';

export interface MutantTestedCallback {
  (mutant: Mutant): void
}

export interface MutantsTestedCallback {
  (mutants: Mutant[]): void
}

export enum MutantStatus {
  
  /**
   * The status of an untested Mutant.
   * @static
   */
  UNTESTED,

  /**
   * The status of a killed Mutant.
   * @static
   */
  KILLED,

  /**
   * The status of a survived Mutant.
   * @static
   */
  SURVIVED,

  /**
   * The status of a timed out Mutant.
   * @static
   */
  TIMEDOUT
}

/**
 * Represents a mutation which has been applied to a file.
 */
export default class Mutant {

  private _typeUtils = new TypeUtils();
  private parserUtils = new ParserUtils();
  private _fileUtils = new FileUtils();
  private _lineNumber: number;
  private _testsRan: TestFile[] = [];
  private _mutatedLine: string;
  private _mutatedCode: string;
  private _mutatedFilename: string;
  private _originalLine: string;
  private _status: MutantStatus;

  /**
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param mutation - The mutation which was applied to this Mutant.
   * @param ast - The abstract syntax tree of the file.
   * @param node - The part of the ast which has been mutated.
   * @param columnNumber - The column which has been mutated.
   */
  constructor(private _filename: string, private _originalCode: string, private _mutation: BaseMutation, private _ast: ESTree.Program, private _node: ESTree.Node, private _columnNumber: number) {
    this._typeUtils.expectParameterObject(_ast, 'Mutant', 'ast');
    this._typeUtils.expectParameterObject(_node, 'Mutant', 'node');

    this._lineNumber = _node.loc.start.line;
    this._mutatedCode = this.parserUtils.generate(_ast, _originalCode);
    this.setStatusUntested();
    this._mutatedLine = _.trim(this._mutatedCode.split('\n')[this._lineNumber - 1]);
    this._originalLine = _.trim(_originalCode.split('\n')[this._lineNumber - 1]);
    this.save();
  }


  /**
   * Inserts the mutated file into an array of source files. The original array is not altered in the process.
   * @function
   * @param {String[]} sourceFiles - The list of source files of which one has to be replaced with the mutated file.
   * @returns {String[]} The list of source files of which one source file has been replaced.
   */
  insertMutatedFile = function(sourceFiles: string[]) {
    this._typeUtils.expectParameterArray(sourceFiles, 'Mutant', 'sourceFiles');
    var mutatedSrc = _.clone(sourceFiles);
    var mutantSourceFileIndex = _.indexOf(mutatedSrc, this.getFilename());
    mutatedSrc[mutantSourceFileIndex] = this.getMutatedFilename();
    return mutatedSrc;
  };

  /**
   * Gets the name of the file which has been mutated.
   * @function
   * @returns {String} The name of the mutated file.
   */
  getFilename() {
    return this._filename;
  };

  /**
   * Gets if the Mutant has the status KILLED.
   * @function
   * @returns {Boolean} True if the Mutant has the status KILLED.
   */
  hasStatusKilled() {
    return this.getStatus() === MutantStatus.KILLED;
  };

  /**
   * Sets the status of the Mutant to KILLED.
   * @function
   */
  setStatusKilled() {
    this.setStatus(MutantStatus.KILLED);
  };

  /**
   * Gets if the Mutant has the status UNTESTED.
   * @function
   * @returns {Boolean} True if the Mutant has the status UNTESTED.
   */
  hasStatusUntested() {
    return this.getStatus() === MutantStatus.UNTESTED;
  };

  /**
   * Sets the status of the Mutant to UNTESTED.
   * @function
   */
  setStatusUntested() {
    this.setStatus(MutantStatus.UNTESTED);
  };

  /**
   * Gets if the Mutant has the status SURVIVED.
   * @function
   * @returns {Boolean} True if the Mutant has the status SURVIVED.
   */
  hasStatusSurvived() {
    return this.getStatus() === MutantStatus.SURVIVED;
  };

  /**
   * Sets the status of the Mutant to SURVIVED.
   * @function
   */
  setStatusSurvived() {
    this.setStatus(MutantStatus.SURVIVED);
  };

  /**
   * Gets if the Mutant has the status TIMEDOUT.
   * @function
   * @returns {Boolean} True if the Mutant has the status TIMEDOUT.
   */
  hasStatusTimedOut() {
    return this.getStatus() === MutantStatus.TIMEDOUT;
  };

  /**
   * Sets the status of the Mutant to TIMEDOUT.
   * @function
   */
  setStatusTimedOut() {
    this.setStatus(MutantStatus.TIMEDOUT);
  };

  /**
   * Gets the Mutation which has been applied.
   * @function
   * @returns The applied Mutation.
   */
  getMutation() {
    return this._mutation;
  };

  /**
   * Gets the source code which contains a mutation.
   * @function
   * @returns The code containing a mutation.
   */
  getMutatedCode() {
    return this._mutatedCode;
  };

  /**
   * Gets the original line of code.
   * @function
   * @returns The original line of code.
   */
  getOriginalLine() {
    return this._originalLine;
  };

  /**
   * Gets the mutated line of code.
   * @function
   * @returns The mutated line of code.
   */
  getMutatedLine() {
    return this._mutatedLine;
  };

  /**
   * Gets the status of the Mutant.
   * @function
   * @returns The status.
   */
  getStatus() {
    return this._status;
  };

  /**
   * Sets the status of the Mutant.
   * @function
   * @param status - The new status.
   */
  setStatus = function(status: MutantStatus) {
    this._status = status;
  };

  /**
   * Gets the line number at which the mutation was applied in the original file.
   * @function
   * @returns {Number} The line number.
   */
  getLineNumber() {
    return this._lineNumber;
  };

  /**
   * Gets the column number at which the mutation was applied in the original file.
   * @function
   * @returns {Number} The column number.
   */
  getColumnNumber() {
    return this._columnNumber;
  };

  /**
   * Sets the tests which were ran on this Mutant.
   * @function
   * @param {TestFile[]} tests - The array of tests which were ran.
   */
  setTestsRan = function(tests: TestFile[]) {
    this._testsRan = tests;
  };

  /**
   * Gets the tests which were ran on this Mutant.
   * @function
   * @returns The array of tests which were ran.
   */
  getTestsRan() {
    return this._testsRan;
  };

  /**
   * Gets the name and path of the mutated file.
   * @function
   * @returns The name and path of the mutated file.
   */
  getMutatedFilename() {
    return this._mutatedFilename;
  };

  /**
   * Saves the mutated code in a mutated file.
   * @function
   */
  save() {
    this._mutatedFilename = this._fileUtils.createFileInTempFolder(this._filename, this._mutatedCode);
  };

  /**
   * Removes the mutated file.
   * @function
   */
  remove() {
    this._fileUtils.removeTempFile(this._mutatedFilename);
  };
}