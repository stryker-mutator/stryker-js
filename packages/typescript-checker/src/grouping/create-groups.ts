import { Mutant } from '@stryker-mutator/api/src/core/index.js';

import { Node } from './node.js';

/**
 * To speed up the type checking we want to check multiple mutants at once.
 * When multiple mutants in different files who can't throw errors in each other we can type check them simultaneously.
 * These mutants who can be tested at the same time are called a group.
 * Therefore the return type is an array of arrays in other words: an array of groups.
 *
 * @param mutants All the mutants of the test project.
 * @param nodes A graph representation of the test project.
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
export function createGroups(mutants: Mutant[], nodes: Map<string, Node>): string[][] {
  const groups: string[][] = [];
  const mutantsToGroup = new Set(mutants);

  while (mutantsToGroup.size) {
    const group: string[] = [];
    const groupNodes = new Set<Node>();
    const nodesToIgnore = new Set<Node>();

    for (const currentMutant of mutantsToGroup) {
      const currentNode = findNode(currentMutant.fileName, nodes);
      if (!nodesToIgnore.has(currentNode) && !parentsHaveOverlapWith(currentNode, groupNodes)) {
        group.push(currentMutant.id);
        groupNodes.add(currentNode);
        mutantsToGroup.delete(currentMutant);
        addAll(nodesToIgnore, currentNode.getAllParentReferencesIncludingSelf());
      }
    }
    groups.push(group);
  }

  return groups;
}

function addAll(nodes: Set<Node>, nodesToAdd: Iterable<Node>) {
  for (const parent of nodesToAdd) {
    nodes.add(parent);
  }
}

function findNode(fileName: string, nodes: Map<string, Node>) {
  const node = nodes.get(fileName);
  if (node == null) {
    throw new Error(`Node not in graph: "${fileName}"`);
  }
  return node;
}
function parentsHaveOverlapWith(currentNode: Node, groupNodes: Set<Node>) {
  for (const parentNode of currentNode.getAllParentReferencesIncludingSelf()) {
    if (groupNodes.has(parentNode)) {
      return true;
    }
  }

  return false;
}
