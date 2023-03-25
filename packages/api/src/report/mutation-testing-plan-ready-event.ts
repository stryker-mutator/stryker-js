import { MutantTestPlan } from '../core/index.js';

export interface MutationTestingPlanReadyEvent {
  mutantPlans: readonly MutantTestPlan[];
}
