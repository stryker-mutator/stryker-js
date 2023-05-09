import { MutantTestPlan, schema } from '../core/index.js';

export interface MutationTestingPlanReadyEvent {
  mutantPlans: readonly MutantTestPlan[];
  report?: schema.MutationTestResult;
}
