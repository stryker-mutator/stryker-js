import { CheckResult } from '@stryker-mutator/api/check';

import { MutantRunPlan } from '../mutants/index.js';
import { ResourceDecorator } from '../concurrent/index.js';

import { CheckerResource } from './checker-resource.js';

export class CheckerFacade extends ResourceDecorator<CheckerResource> {
  public async check(checkerName: string, mutants: MutantRunPlan[]): Promise<Array<[MutantRunPlan, CheckResult]>> {
    const result = Object.entries(
      await this.innerResource.check(
        checkerName,
        mutants.map((mr) => mr.mutant)
      )
    );

    // Check if the checker returned all the mutants that was given
    // When a mutant is missing this will be found in the map underneath
    if (result.length !== mutants.length) throw new Error(`Checker ${checkerName} did not return the expected amount of mutants while checking.`);

    return result.map(([id, res]) => {
      const mutant = mutants.find((m) => m.mutant.id === id);
      if (!mutant) throw new Error(`Checker ${checkerName} returned an mutant id which does not exists.`);
      return [mutant, res];
    });
  }

  public async group(checkerName: string, mutants: MutantRunPlan[]): Promise<MutantRunPlan[][]> {
    const groupsById = await this.innerResource.group(
      checkerName,
      mutants.map((mr) => mr.mutant)
    );

    // Check if the checker returned all the mutants that was given
    // When a mutant is missing this will be found in the map underneath
    const count = groupsById.reduce((currentCount, group) => currentCount + group.length, 0);
    if (count !== mutants.length) throw new Error(`Checker ${checkerName} did not return the expected amount of mutants while creating groups.`);

    return groupsById.map((group) =>
      group.map((id) => {
        const mutant = mutants.find((m) => m.mutant.id === id);
        if (!mutant) throw new Error(`Checker ${checkerName} returned an mutant id which does not exists.`);
        return mutant;
      })
    );
  }
}
