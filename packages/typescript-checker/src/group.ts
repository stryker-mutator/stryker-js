import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { SourceFiles } from './compilers/compiler';

import { toPosixFileName } from './fs/tsconfig-helpers';

/**
 * To speed up the type checking we want to check multiple mutants at once.
 * When multiple mutants in different files who can't throw errors in each other we can type check them simultaneously.
 * These mutants who can be tested at the same time are called a group.
 * Therefore the return type is an array of arrays in other words: an array of groups.
 *
 * @example
 * Let's assume we got tho following project structure and in every file is one mutant.
 *
 *          ========
 *          = A.ts =
 *          ========
 *         /        \
 * ========          ========
 * = B.ts =          = C.ts =
 * ========          ========
 *                           \
 *                            ========
 *                            = D.ts =
 *                            ========
 *
 * A imports B and C
 * C imports D
 *
 * In this example we can type check B and D at the same time.
 * This is because these files can't throw errors in each other.
 * If we type check them and let's say B throws an error.
 * We know for sure that the mutant in B was the one creating the type error.
 * If we type check B and D at the same time it is possible that an error shows up in A.
 * When this happens we go down de dependency graph and individual test the mutants who were in that group.
 *
 * In this function we create the groups of mutants who can be tested at the same time.
 */
export function createGroups(sourceFiles: SourceFiles, mutants: MutantTestCoverage[]): MutantTestCoverage[][] {
  const mutantsWithoutGroup = [...mutants];
  let groups: MutantTestCoverage[][] = [];

  let firstMutant;
  while ((firstMutant = mutantsWithoutGroup.pop())) {
    const firstMutantFilename = toPosixFileName(firstMutant.fileName);
    const firstSourceFile = sourceFiles.get(firstMutantFilename);

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
      const activeSourceFile = sourceFiles.get(toPosixFileName(activeMutant.fileName));

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
