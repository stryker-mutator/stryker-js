import { expressionMutantPlacer } from './expression-mutant-placer.js';
import { MutantPlacer } from './mutant-placer.js';
import { statementMutantPlacer } from './statement-mutant-placer.js';
import { switchCaseMutantPlacer } from './switch-case-mutant-placer.js';

export * from './mutant-placer.js';
export * from './throw-placement-error.js';
export const allMutantPlacers: readonly MutantPlacer[] = Object.freeze([
  expressionMutantPlacer,
  statementMutantPlacer,
  switchCaseMutantPlacer,
]);
