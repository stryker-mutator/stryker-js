import { MutantCoverage } from './mutant-coverage.js';

/**
 * Identifiers used when instrumenting the code
 */
export const INSTRUMENTER_CONSTANTS = Object.freeze({
  NAMESPACE: '__stryker__',
  MUTATION_COVERAGE_OBJECT: identity('mutantCoverage'),
  ACTIVE_MUTANT: identity('activeMutant'),
  CURRENT_TEST_ID: identity('currentTestId'),
  HIT_COUNT: identity('hitCount'),
  HIT_LIMIT: identity('hitLimit'),
  ACTIVE_MUTANT_ENV_VARIABLE: '__STRYKER_ACTIVE_MUTANT__',
} as const);

export interface InstrumenterContext {
  activeMutant?: string;
  currentTestId?: string;
  mutantCoverage?: MutantCoverage;
  hitCount?: number;
  hitLimit?: number;
}

function identity<T extends keyof InstrumenterContext>(key: T): T {
  return key;
}
