import { Mutant } from '../core/mutant.js';

export interface InstrumentRunCompletedEvent {
  mutants: readonly Mutant[];
}
