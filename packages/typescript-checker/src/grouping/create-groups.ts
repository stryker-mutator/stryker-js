import { Mutant } from '@stryker-mutator/api/core';

import { toPosixFileName } from '../tsconfig-helpers.js';

import { TSFileNode } from './ts-file-node.js';

/**
 * To speed up the type-checking we want to check multiple mutants at once.
 * When multiple mutants in different files don't have overlap in affected files (or have small overlap), we can type-check them simultaneously.
 * These mutants who can be tested at the same time are called a group.
 * Therefore, the return type is an array of arrays, in other words: an array of groups.
 *
 * @param mutants All the mutants of the test project.
 * @param nodes A graph representation of the test project.
 *
 * @example
 * Let's assume we got the following dependencies in files of a project, and in every file is one mutant.
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
 * In this example, we can type-check B and D simultaneously.
 * This is because these files can't throw errors in each other.
 * If we type check them, let's say B reports an error.
 * We know that the mutant in B created the type error.
 * If we type check B and D at the same time, it is possible that an error shows up in A.
 * When this happens, we go down the dependency graph and individually test the mutants in that group.
 *
 * In this function, we create groups of mutants who can be tested at the same time.
 */
export function createGroups(
  mutants: Mutant[],
  nodes: Map<string, TSFileNode>,
): string[][] {
  const groups: string[][] = [];
  // The file of a mutant and the files that (indirectly) import a file don't change while grouping.
  // Both are looked up once, instead of once for every mutant in every pass.
  const parentReferencesByNode = new Map<TSFileNode, Set<TSFileNode>>();
  const mutantsToGroup = new Set(
    mutants.map(({ id, fileName }) => ({
      id,
      node: findNode(fileName, nodes),
    })),
  );

  while (mutantsToGroup.size) {
    const group: string[] = [];
    const groupNodes = new Set<TSFileNode>();
    const nodesToIgnore = new Set<TSFileNode>();

    for (const currentMutant of mutantsToGroup) {
      const currentNode = currentMutant.node;
      if (nodesToIgnore.has(currentNode)) {
        continue;
      }
      const parentReferences = getAllParentReferencesIncludingSelf(
        currentNode,
        parentReferencesByNode,
      );
      if (haveOverlap(parentReferences, groupNodes)) {
        // The group only grows during a pass, so the other mutants in this file can't join this group either.
        nodesToIgnore.add(currentNode);
      } else {
        group.push(currentMutant.id);
        groupNodes.add(currentNode);
        mutantsToGroup.delete(currentMutant);
        addRangeOfNodesToSet(nodesToIgnore, parentReferences);
      }
    }
    groups.push(group);
  }

  return groups;
}

function getAllParentReferencesIncludingSelf(
  node: TSFileNode,
  parentReferencesByNode: Map<TSFileNode, Set<TSFileNode>>,
): Set<TSFileNode> {
  let parentReferences = parentReferencesByNode.get(node);
  if (!parentReferences) {
    parentReferences = node.getAllParentReferencesIncludingSelf();
    parentReferencesByNode.set(node, parentReferences);
  }
  return parentReferences;
}

function addRangeOfNodesToSet(
  nodes: Set<TSFileNode>,
  nodesToAdd: Iterable<TSFileNode>,
) {
  for (const parent of nodesToAdd) {
    nodes.add(parent);
  }
}

function findNode(fileName: string, nodes: Map<string, TSFileNode>) {
  const node = nodes.get(toPosixFileName(fileName));
  if (node == null) {
    throw new Error(`Node not in graph: ${fileName}`);
  }
  return node;
}

function haveOverlap(
  parentReferences: Set<TSFileNode>,
  groupNodes: Set<TSFileNode>,
): boolean {
  const [smallest, largest] =
    parentReferences.size < groupNodes.size
      ? [parentReferences, groupNodes]
      : [groupNodes, parentReferences];
  for (const node of smallest) {
    if (largest.has(node)) {
      return true;
    }
  }
  return false;
}
