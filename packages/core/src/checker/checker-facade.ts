import { CheckResult } from '@stryker-mutator/api/check';
import { MutantRunPlan } from '@stryker-mutator/api/core';

import { ResourceDecorator } from '../concurrent/index.js';

import { CheckerResource } from './checker-resource.js';

function toMap(mutantRunPlans: MutantRunPlan[]) {
  return new Map<string, MutantRunPlan>(
    mutantRunPlans.map((mutant) => [mutant.mutant.id, mutant]),
  );
}

export class CheckerFacade extends ResourceDecorator<CheckerResource> {
  public async check(
    checkerName: string,
    mutantRunPlans: MutantRunPlan[],
  ): Promise<Array<[MutantRunPlan, CheckResult]>> {
    const innerCheckerResult = Object.entries(
      await this.innerResource.check(
        checkerName,
        mutantRunPlans.map((mr) => mr.mutant),
      ),
    );

    // Check if the checker returned all the mutants that was given
    // When a mutant is missing this will be found in the map underneath
    const mutantRunPlanMap = toMap(mutantRunPlans);

    const results = innerCheckerResult.map(([id, res]) => {
      const mutantRunPlan = mutantRunPlanMap.get(id);
      if (!mutantRunPlan)
        throw new Error(
          `Checker "${checkerName}" returned a check result for mutant id "${id}", but a check wasn't requested for it. Stryker asked to check mutant ids: ${mutantRunPlans
            .map(({ mutant }) => mutant.id)
            .join(',')}`,
        );
      return [mutantRunPlan, res] as [MutantRunPlan, CheckResult];
    });

    if (mutantRunPlans.length > results.length) {
      const resultIds = new Set(results.map(([{ mutant }]) => mutant.id));
      const missingIds = mutantRunPlans
        .map(({ mutant }) => mutant.id)
        .filter((id) => !resultIds.has(id));
      throw new Error(
        `Checker "${checkerName}" was missing check results for mutant ids "${missingIds.join(',')}", while Stryker asked to check them`,
      );
    }

    return results;
  }

  public async group(
    checkerName: string,
    mutantRunPlans: MutantRunPlan[],
  ): Promise<MutantRunPlan[][]> {
    const mutantIdGroups = await this.innerResource.group(
      checkerName,
      mutantRunPlans.map((mr) => mr.mutant),
    );

    // Check if the checker returned all the mutants that was given
    // When a mutant is missing this will be found in the map underneath
    const mutantRunPlanMap = toMap(mutantRunPlans);
    const groupedMutantIds = new Set<string>();
    const groups = mutantIdGroups.map((group) =>
      group.map((id) => {
        const mutantRunPlan = mutantRunPlanMap.get(id);
        groupedMutantIds.add(id);
        if (!mutantRunPlan)
          throw new Error(
            `Checker "${checkerName}" returned a group result for mutant id "${id}", but a group wasn't requested for it. Stryker asked to group mutant ids: ${mutantRunPlans
              .map(({ mutant }) => mutant.id)
              .join(',')}!`,
          );
        return mutantRunPlan;
      }),
    );
    if (mutantRunPlans.length > groupedMutantIds.size) {
      const missingIds = mutantRunPlans
        .map(({ mutant }) => mutant.id)
        .filter((id) => !groupedMutantIds.has(id));
      throw new Error(
        `Checker "${checkerName}" was missing group results for mutant ids "${missingIds.join(',')}", while Stryker asked to group them!`,
      );
    }
    return groups;
  }
}
