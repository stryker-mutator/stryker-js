import { Mutant } from '@stryker-mutator/api/src/core/index.js';

import { findNode } from './mutant-selector-helpers.js';

import { Node } from './node.js';

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
export function createGroups(mutants: Mutant[], nodes: Node[]): string[][] {
  const groups: Mutant[][] = [];
  let mutant: Mutant | null = selectNewMutant(mutants, groups);

  // Loop until all the mutants are in a group
  while (mutant != null) {
    // Copy the list of mutants who are not in a group
    const mutantWhoAreNotInAGroup = [...mutants];
    // The first mutant is always in a group
    const group: Mutant[] = [mutant];
    const node = findNode(mutant.fileName, nodes);

    if (node === null) throw new Error('Node not in graph');

    // Fill the ignoreList
    let nodesToIgnore: Set<Node> = node.getAllParentReferencesIncludingSelf();

    // Loop through the nodes who can possibly go in the group
    for (const mutantSelected of mutantWhoAreNotInAGroup) {
      const nodeSelected = findNode(mutantSelected.fileName, nodes);

      if (nodeSelected === null) throw new Error('Node not in graph');

      // Check if parents of node are not in the group
      const groupNodes: Set<Node> = getNodesFromMutants(group, nodes);
      if (currentNodeHasParentsInNodesToIgnoreList(nodeSelected, new Set<Node>(groupNodes))) continue;

      // See if the node can be in the group
      if (nodesToIgnore.has(nodeSelected)) continue;

      // Push the group
      group.push(mutantSelected);
      mutants.splice(mutants.indexOf(mutantSelected), 1);
      // Add to the ignoreList
      nodesToIgnore = new Set<Node>([...nodesToIgnore, ...nodeSelected.getAllParentReferencesIncludingSelf()]);
    }

    groups.push(group);
    mutant = selectNewMutant(mutants, groups);
  }

  return groupsToString(groups);
}

function selectNewMutant(mutants: Mutant[], groups: Mutant[][]): Mutant | null {
  const flatGroups = groups.flat();

  for (let i = 0; i < mutants.length; i++) {
    if (!flatGroups.includes(mutants[i])) {
      const mutant = mutants.splice(i, 1);
      return mutant[0];
    }
  }

  return null;
}

function groupsToString(groups: Mutant[][]): string[][] {
  return groups.map((group) => group.map((mutant) => mutant.id));
}

function currentNodeHasParentsInNodesToIgnoreList(nodeSelected: Node, nodesToIgnore: Set<Node>) {
  let result = false;
  nodeSelected.getAllParentReferencesIncludingSelf().forEach((parentNode) => {
    if (nodesToIgnore.has(parentNode)) {
      result = true;
    }
  });
  return result;
}

function getNodesFromMutants(group: Mutant[], nodes: Node[]): Set<Node> {
  return new Set<Node>(
    group.map((mutant) => {
      const node = findNode(mutant.fileName, nodes);
      if (!node) {
        throw new Error('node not found');
      }
      return node;
    })
  );
}
