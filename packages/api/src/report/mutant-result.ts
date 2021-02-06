import { Location, Range } from '../core';

import { MutantStatus } from './mutant-status';

export interface BaseMutantResult {
  id: string;
  fileName: string;
  mutatorName: string;
  replacement: string;
  originalLines: string;
  mutatedLines: string;
  nrOfTestsRan: number;
  location: Location;
  range: Range;
}

export interface KilledMutantResult extends BaseMutantResult {
  status: MutantStatus.Killed;
  killedBy: string;
}

export interface InvalidMutantResult extends BaseMutantResult {
  status: MutantStatus.CompileError | MutantStatus.RuntimeError;
  errorMessage: string;
}

export interface IgnoredMutantResult extends BaseMutantResult {
  status: MutantStatus.Ignored;
  ignoreReason: string;
}

export interface UndetectedMutantResult extends BaseMutantResult {
  status: MutantStatus.NoCoverage | MutantStatus.Survived;
  testFilter: string[] | undefined;
}

export interface TimeoutMutantResult extends BaseMutantResult {
  status: MutantStatus.TimedOut;
}

export type MutantResult = IgnoredMutantResult | InvalidMutantResult | KilledMutantResult | TimeoutMutantResult | UndetectedMutantResult;
