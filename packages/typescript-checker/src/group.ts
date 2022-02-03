import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { SourceFiles } from './compilers/compiler';

import { toPosixFileName } from './fs/tsconfig-helpers';

export function createGroups(sourceFiles: SourceFiles, mutants: MutantTestCoverage[]): MutantTestCoverage[][] {
  const mutantsWithoutGroup = [...mutants];
  let groups: MutantTestCoverage[][] = [];

  let firstMutant;
  while ((firstMutant = mutantsWithoutGroup.pop())) {
    const firstMutantFilename = toPosixFileName(firstMutant.fileName);
    const firstSourceFile = sourceFiles[firstMutantFilename];

    const group: Array<{ fileName: string; mutant: MutantTestCoverage }> = [{ fileName: firstMutantFilename, mutant: firstMutant }];

    // We allow people to mutate files that are not included in this ts project
    if (!firstSourceFile) {
      addGroupToList();
      continue;
    }

    const ignoreList = new Set([firstSourceFile.fileName, ...firstSourceFile.importedBy]);
    const indexesToRemove: number[] = [];

    for (let index = 0; index < mutantsWithoutGroup.length; index++) {
      const activeMutant = mutantsWithoutGroup[index];
      const activeSourceFile = sourceFiles[toPosixFileName(activeMutant.fileName)];

      // We allow people to mutate files that are not included in this ts project
      // If the mutant is in the same file as the previous, skip it because it will never fit.
      if (!activeSourceFile || activeSourceFile.fileName === group[index - 1]?.fileName) continue;

      if (!ignoreList.has(activeSourceFile.fileName) && !dependencyInGroup([...activeSourceFile.importedBy], group)) {
        indexesToRemove.push(index);
        group.push({ fileName: activeSourceFile.fileName, mutant: activeMutant });
        ignoreList.add(activeSourceFile.fileName);
        activeSourceFile.importedBy.forEach((importBy) => ignoreList.add(importBy));
      }
    }

    addGroupToList();

    function addGroupToList() {
      for (let i = indexesToRemove.length; i--; ) {
        mutantsWithoutGroup.splice(indexesToRemove[i], 1);
      }

      groups = [...groups, group.map((g) => g.mutant)];
    }
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
