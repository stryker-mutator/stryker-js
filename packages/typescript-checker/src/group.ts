import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { SourceFiles } from './compilers/compiler';

import { toPosixFileName } from './fs/tsconfig-helpers';

/**
 * To speed up the TypeChecking we want to check multiple mutants at once.
 * When there are multiple mutants in different files who can't throw errors in eachother we can TypeCheck them simultaneously.
 * These mutants who can be tested at the same time are called a group.
 * Therefore the return type is an array of arrays in other words: an array of groups.
 *
 * @example
 * Lets assume we got tho following project structure and in every file is one mutant.
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
 * In this example we can TypeCheck B and D at the same time.
 * This is because these files can't throw errors in eachother.
 * If we typecheck them and lets say B throws an error.
 * We know forsure that the mutant in B was one creating the type error.
 * If we typecheck B and D at the same time it is possible that an error shows up in A.
 * When this happens we go down de dependency graph and individual test the mutants who were in that group.
 *
 * In this function we create the groups of mutants who can be tested at the same time.
 */
export function createGroups(sourceFiles: SourceFiles, mutants: MutantTestCoverage[]): MutantTestCoverage[][] {
  let mutantsWithoutGroup = [...mutants];
  let groups: MutantTestCoverage[][] = [];

  while (mutantsWithoutGroup.length) {
    const firstMutant = mutantsWithoutGroup[0];
    const firstMutantFilename = toPosixFileName(firstMutant.fileName);
    const firstSourceFile = sourceFiles.get(firstMutantFilename);

    const group: Array<{ fileName: string; mutant: MutantTestCoverage }> = [{ fileName: firstMutantFilename, mutant: firstMutant }];

    // We allow people to mutate files that are not included in this ts project
    if (!firstSourceFile) {
      addGroupToList();
      continue;
    }

    let ignoreList = [firstSourceFile.fileName, ...firstSourceFile.importedBy];

    // start with 1 because we already took the first mutant.
    for (let index = 1; index < mutantsWithoutGroup.length; index++) {
      const activeMutant = mutantsWithoutGroup[index];
      const activeSourceFile = sourceFiles.get(toPosixFileName(activeMutant.fileName));

      // We allow people to mutate files that are not included in this ts project
      // If the mutant is in the same file as the previous, skip it because it will never fit.
      if (!activeSourceFile || activeSourceFile.fileName === group[index - 1]?.fileName) continue;

      if (!ignoreList.includes(activeSourceFile.fileName) && !dependencyInGroup([...activeSourceFile.importedBy], group)) {
        group.push({ fileName: activeSourceFile.fileName, mutant: activeMutant });
        ignoreList = [...ignoreList, activeSourceFile.fileName, ...activeSourceFile.importedBy];
      }
    }

    addGroupToList();

    function addGroupToList() {
      // Can be improved, we know the index in the for loop but can't remove it because we loop over the same array we want te remove from
      // A solution can be to store a array with indexes to remove
      mutantsWithoutGroup = mutantsWithoutGroup.filter((m) => !group.find((g) => g.mutant.id === m.id));
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
