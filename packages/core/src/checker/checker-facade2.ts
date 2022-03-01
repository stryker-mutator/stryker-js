import { CheckResult } from '@stryker-mutator/api/check';

import { MutantRunPlan } from '../mutants/index.js';
import { ResourceDecorator } from '../concurrent/index.js';

import { CheckerResource } from './checker-resource.js';

export class CheckerFacade extends ResourceDecorator<CheckerResource> {
  public async check(checkerName: string, mutant: MutantRunPlan[]): Promise<Array<[MutantRunPlan, CheckResult]>> {
    return [];
  }

  public async group(checkerName: string, mutants: MutantRunPlan[]): Promise<MutantRunPlan[][]> {
    return [];
  }
}
