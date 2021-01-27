/**
 * A specific spot in the source code based on line and column.
 * Stryker uses zero-based indexes. So the first character in a file is at line 0, column 0.
 */
export interface Position {
  line: number;
  column: number;
}
