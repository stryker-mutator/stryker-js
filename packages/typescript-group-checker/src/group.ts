import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { SourceFiles } from './compilers/compiler';

import { toPosixFileName } from './fs/tsconfig-helpers';

export function createGroups(sourceFiles: SourceFiles, mutants: MutantTestCoverage[]): MutantTestCoverage[][] {
  let mutantsWithoutGroup = [...mutants];
  let groups: MutantTestCoverage[][] = [];

  while (mutantsWithoutGroup.length) {
    const firstMutant = mutantsWithoutGroup[0];
    const firstSourceFile = sourceFiles[toPosixFileName(firstMutant.fileName)];

    const group: Array<{ fileName: string; mutant: MutantTestCoverage }> = [{ fileName: firstSourceFile.fileName, mutant: firstMutant }];
    let ignoreList = [firstSourceFile.fileName, ...firstSourceFile.dependencies];

    // start with 1 because we already took the first mutant.
    for (let index = 1; index < mutantsWithoutGroup.length; index++) {
      const activeMutant = mutantsWithoutGroup[index];
      const activeSourceFile = sourceFiles[toPosixFileName(activeMutant.fileName)];

      // If the mutant is in the same file as the previous, skip it because it will never fit.
      if (activeSourceFile.fileName === group[index - 1]?.fileName) continue;

      if (!ignoreList.includes(activeSourceFile.fileName) && !dependencyInGroup([...activeSourceFile.dependencies], group)) {
        group.push({ fileName: activeSourceFile.fileName, mutant: activeMutant });
        ignoreList = [...ignoreList, activeSourceFile.fileName, ...activeSourceFile.dependencies];
      }
    }

    // Can be improved, we know the index in the for loop but can't remove it because we loop over the same array we want te remove from
    // A solution can be to store a array with indexes to remove
    mutantsWithoutGroup = mutantsWithoutGroup.filter((m) => !group.find((g) => g.mutant.id === m.id));
    groups = [...groups, group.map((g) => g.mutant)];
  }

  return groups;
}

function dependencyInGroup(dependencies: string[], group: Array<{ fileName: string; mutant: Mutant }>): boolean {
  for (const dependency of dependencies) {
    for (const mutant of group) {
      if (mutant.fileName === dependency) {
        return true;
      }
    }
  }

  return false;
}
