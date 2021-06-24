import { expressionMutantPlacer } from './expression-mutant-placer';
import { MutantPlacer } from './mutant-placer';
import { statementMutantPlacer } from './statement-mutant-placer';
import { switchCaseMutantPlacer } from './switch-case-mutant-placer';

export * from './mutant-placer';
export * from './throw-placement-error';
export const allMutantPlacers: readonly MutantPlacer[] = Object.freeze([expressionMutantPlacer, statementMutantPlacer, switchCaseMutantPlacer]);
