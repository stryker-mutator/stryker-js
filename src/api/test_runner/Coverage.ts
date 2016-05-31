import {Location} from '../core'

/**
 * Represents a collection of Coverage results for a set of files.
 */
export interface CoverageCollection {
  /**
   * An array of CoverageResults for files.
   */
  [filename: string]: CoverageResult;
}

/**
 * Represents the coverage result for a single file.
 */
export interface CoverageResult {
  /**
   * Hash of statement counts, where keys are statement IDs.
   */
  s: CoverageData;
  
  /**
   * The coverage data for the branches
   */
  b?: BrancheCoverageData;
  
  /**
   * Hash of function counts, where keys are function IDs
   */
  f?: CoverageData;
  
  /**
   * Hash of line counts, where keys are the line number.
   */
  l?: CoverageData;
  
  /**
   * The FunctionMap
   */
  fnMap?: FunctionMap;
  
  /**
   * The BranchMap
   */
  branchMap?: BranchMap;
  
  /**
   * The StatementMap
   */
  statementMap: StatementMap;
  path?: string;
}

/**
 * Indicates the amount of time a certain type of data was covered. 
 * The key depends on the context. This can for example be a line number, making the value the amount of times the line was covered. 
 */
export interface CoverageData {
  [ref: string]: number;
}

/**
 * Hash of branch counts, where keys are branch IDs and values are arrays of counts.
 * For an if statement, the value would have two counts; one for the if, and one for the else. 
 * Switch statements would have an array of values for each case.
 */
export interface BrancheCoverageData {
  [ref: string]: [number, number];
}

/**
 * Hash of functions where keys are function IDs, and values are {name, line, loc, skip}, where name is the name of the function, 
 * line is the line the function is declared on, and loc is the Location of the function declaration (just the declaration, not the entire function body)
 */
export interface FunctionMap {
  [ref: string]: FunctionDescription;
}

/**
 * The description of a function.
 */
export interface FunctionDescription {
  name: string;
  line: number;
  loc: Location;
}

/**
 * Hash where keys are branch IDs, and values are {line, type, locations} objects. 
 * line is the line the branch starts on. type is the type of the branch (e.g. "if", "switch"). 
 * locations is an array of Location objects, one for each possible outcome of the branch. 
 * Note for an if statement where there is no else clause, there will still be two locations generated.
 */
export interface BranchMap {
  [ref: string]: BranchDescription;
}

/**
 * The description of a branch.
 */
export interface BranchDescription {
  line: number;
  type: string;
  locations: Location[];
}

/**
 * Hash where keys are statement IDs, and values are Location objects for each statement. 
 * The Location for a function definition is really an assignment, and should include the entire function.
 */
export interface StatementMap {
  [ref: string]: Location;
}

