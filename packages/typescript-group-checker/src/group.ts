import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { SourceFiles } from './compiler';

import { toPosixFileName } from './fs/tsconfig-helpers';

export function createGroups(sourceFiles: SourceFiles, mutants: MutantTestCoverage[]): MutantTestCoverage[][] {
  let leftOverMutants = [...mutants];
  let groups: MutantTestCoverage[][] = [];

  while (leftOverMutants.length) {
    const firstMutant = leftOverMutants[0];
    const mutantFileName = toPosixFileName(firstMutant.fileName);
    const firstNode = sourceFiles[mutantFileName];
    const group: Array<{ fileName: string; mutant: MutantTestCoverage }> = [{ fileName: mutantFileName, mutant: firstMutant }];
    let ignoreList = [mutantFileName, ...firstNode.dependencies];

    // start with 1 because we already took the first mutant
    for (let index = 1; index < leftOverMutants.length; index++) {
      const activeMutant = leftOverMutants[index];
      const activeMutantFileName = toPosixFileName(activeMutant.fileName);
      const activeNode = sourceFiles[activeMutantFileName];

      if (activeMutantFileName === group[index - 1]?.fileName) continue;

      if (!ignoreList.includes(activeMutantFileName) && !dependencyInGroup([...activeNode.dependencies], group)) {
        group.push({ fileName: activeMutantFileName, mutant: activeMutant });
        ignoreList = [...ignoreList, activeMutantFileName, ...activeNode.dependencies];
      }
    }

    leftOverMutants = leftOverMutants.filter((m) => group.findIndex((g) => g.mutant.id === m.id) === -1);
    groups = [...groups, group.map((g) => g.mutant)];
  }

  return groups;
}

function dependencyInGroup(dependencies: string[], group: Array<{ fileName: string; mutant: Mutant }>): boolean {
  for (const dependency of dependencies) {
    for (const node of group) {
      if (node.fileName === dependency) {
        return true;
      }
    }
  }

  return false;
}
