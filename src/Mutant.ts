'use strict';

import * as _ from'lodash';
import BaseMutation from './mutations/BaseMutation';
import FileUtils from './utils/FileUtils';
import ParserUtils from './utils/ParserUtils';
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
  public status: MutantStatus;
  public testsRan: TestFile[] = [];
  
  private fileUtils = new FileUtils();
  private parserUtils = new ParserUtils();
  private _lineNumber: number;
  private _mutatedCode: string;
  private _mutatedFilename: string;
  private _mutatedLine: string;
  private _originalLine: string;
  
  get columnNumber(): number {
    return this._columnNumber;
  };

  get filename(): string {
    return this._filename;
  };

  get lineNumber(): number {
    return this._lineNumber;
  };

  get mutatedCode(): string {
    return this._mutatedCode;
  };
  
  get mutatedFilename(): string {
    return this._mutatedFilename;
  };

  get mutatedLine(): string {
    return this._mutatedLine;
  };
  
  get mutation(): BaseMutation {
    return this._mutation;
  };

  get originalLine(): string {
    return this._originalLine;
  };

  /**
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param mutation - The mutation which was applied to this Mutant.
   * @param ast - The abstract syntax tree of the file.
   * @param node - The part of the ast which has been mutated.
   * @param columnNumber - The column which has been mutated.
   */
  constructor(private _filename: string, originalCode: string, private _mutation: BaseMutation, ast: ESTree.Program, node: ESTree.Node, private _columnNumber: number) {    
    this._lineNumber = node.loc.start.line;
    this._mutatedCode = this.parserUtils.generate(ast, originalCode);
    this.status = MutantStatus.UNTESTED;
    this._mutatedLine = _.trim(this.mutatedCode.split('\n')[this._lineNumber - 1]);
    this._originalLine = _.trim(originalCode.split('\n')[this._lineNumber - 1]);
    this.save();
  }

  /**
   * Inserts the mutated file into an array of source files. The original array is not altered in the process.
   * @function
   * @param {String[]} sourceFiles - The list of source files of which one has to be replaced with the mutated file.
   * @returns {String[]} The list of source files of which one source file has been replaced.
   */
  insertMutatedFile = function(sourceFiles: string[]) {
    var mutatedSrc = _.clone(sourceFiles);
    var mutantSourceFileIndex = _.indexOf(mutatedSrc, this.filename);
    mutatedSrc[mutantSourceFileIndex] = this.mutatedFilename;
    return mutatedSrc;
  };

  /**
   * Saves the mutated code in a mutated file.
   * @function
   */
  save() {
    this._mutatedFilename = this.fileUtils.createFileInTempFolder(this.filename, this.mutatedCode);
  };

  /**
   * Removes the mutated file.
   * @function
   */
  remove() {
    this.fileUtils.removeTempFile(this.mutatedFilename);
  };
}