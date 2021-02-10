export interface MutatorOptions {
  excludedMutations: string[];
  specificMutants?: Array<{ filename: string; start: { line: number; column: number }; end: { line: number; column: number } }>;
}
