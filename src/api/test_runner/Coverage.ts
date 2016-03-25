export interface CoverageCollection {
  [fileName: string]: CoverageResult;
}

export interface CoverageResult {
  s: CoverageData;
  b?: BrancheCoverageData;
  f?: CoverageData;
  l?: CoverageData;
  fnMap?: FunctionMap;
  branchMap?: BranchMap;
  statementMap: StatementMap;
  path?: string;
}

export interface CoverageData {
  [ref: string]: number;
}

export interface BrancheCoverageData {
  [ref: string]: [number, number];
}

export interface FunctionMap {
  [ref: string]: FunctionDescription;
}

export interface FunctionDescription {
  name: string;
  line: number;
  loc: Location;
}

export interface BranchMap {
  [ref: string]: BranchDescription;
}

export interface BranchDescription {
  line: number;
  type: string;
  locations: Location[];
}

export interface StatementMap {
  [ref: string]: Location;
}

export interface Location {
  start: Position,
  end: Position
}

export interface Position {
  line: number;
  column: number;
}
