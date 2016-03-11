'use strict';

import * as _ from'lodash';
import BaseMutation from './mutations/BaseMutation';
import FileUtils from './utils/FileUtils';
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
  public status: MutantStatus;
  public testsRan: TestFile[] = [];
  
  private fileUtils = new FileUtils();
  private typeUtils = new TypeUtils();
  private _mutatedCode: string;
  private _mutatedFilename: string;
  private _mutatedLine: string;
  private _originalLine: string;
  
  get columnNumber(): number {
    return this.mutatedLocation.start.column;
  };

  get filename(): string {
    return this._filename;
  };

  get lineNumber(): number {
    return this.mutatedLocation.start.line;
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
   * @param mutation - The mutation which was applied to this Mutant.
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param substitude - The mutated code wich will replace a part of the originalCode.
   * @param mutatedLocation - The part of the originalCode which has been mutated.
   */
  constructor(private _mutation: BaseMutation, private _filename: string, private _originalCode: string, substitude: string, private mutatedLocation: ESTree.SourceLocation) {   
    this.status = MutantStatus.UNTESTED;
    
    var linesOfCode = this._originalCode.split('\n');
      
    if(this.mutatedLocation.start.line === this.mutatedLocation.end.line){
      this._originalLine = linesOfCode[this.mutatedLocation.start.line - 1];
      this._mutatedLine = this._originalLine.substring(0, this.mutatedLocation.start.column) + substitude + this._originalLine.substring(this.mutatedLocation.end.column);
      linesOfCode[this.mutatedLocation.start.line - 1] = this._mutatedLine;
    } else {
      this._originalLine = "";
      for (var lineNum = this.mutatedLocation.start.line - 1; lineNum < this.mutatedLocation.end.line; lineNum++) {
        this._originalLine += linesOfCode[lineNum];
        if(lineNum >= this.mutatedLocation.start.line && lineNum < this.mutatedLocation.end.line - 1) {
          linesOfCode[lineNum] = '';
        }
        if(lineNum < this.mutatedLocation.end.line - 1){
          this._originalLine += '\n';
        }       
      }  
      
      this._mutatedLine = linesOfCode[this.mutatedLocation.start.line - 1].substring(0, this.mutatedLocation.start.column);
      this._mutatedLine += substitude;
      this._mutatedLine += linesOfCode[this.mutatedLocation.end.line - 1].substring(this.mutatedLocation.end.column);
      linesOfCode[this.mutatedLocation.end.line - 1] = this._mutatedLine;
    }
    
    this._mutatedCode = linesOfCode.join('\n');
    
    this._originalLine.trim();
    this._mutatedLine.trim();
    
    this.save();
  }

  /**
   * Inserts the mutated file into an array of source files. The original array is not altered in the process.
   * @function
   * @param {String[]} sourceFiles - The list of source files of which one has to be replaced with the mutated file.
   * @returns {String[]} The list of source files of which one source file has been replaced.
   */
  insertMutatedFile = function(sourceFiles: string[]) {
    this.typeUtils.expectParameterArray(sourceFiles, 'Mutant', 'sourceFiles');
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