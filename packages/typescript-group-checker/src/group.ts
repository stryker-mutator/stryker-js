import { Mutant } from '@stryker-mutator/api/core';

import { toPosixFileName } from './fs/tsconfig-helpers';

import { DependencyGraph } from './graph/dependency-graph';
import { DependencyNode } from './graph/dependency-node';

export function createGroups(graph: DependencyGraph, mutants: Mutant[]): Mutant[][] {
  let leftOverMutants = [...mutants];
  let groups: Mutant[][] = [];

  while (leftOverMutants.length) {
    const firstMutant = leftOverMutants[0];
    const firstNode = graph.nodes[toPosixFileName(firstMutant.fileName)];
    const group: Array<{ node: DependencyNode; mutant: Mutant }> = [{ node: firstNode, mutant: firstMutant }];
    let ignoreList = [firstNode, ...firstNode.getAllDependencies()];

    // start with 1 because we already took the first mutant
    for (let index = 1; index < leftOverMutants.length; index++) {
      const activeMutant = leftOverMutants[index];
      const activeNode = graph.nodes[toPosixFileName(activeMutant.fileName)];

      if (!ignoreList.includes(activeNode) && !dependencyInGroup(activeNode.getAllDependencies(), group)) {
        group.push({ node: activeNode, mutant: activeMutant });
        ignoreList = [...ignoreList, activeNode, ...activeNode.getAllDependencies()];
      }
    }

    leftOverMutants = leftOverMutants.filter((m) => group.findIndex((g) => g.mutant.id === m.id) === -1);
    groups = [...groups, group.map((g) => g.mutant)];
  }

  return groups;
}

function dependencyInGroup(dependencies: DependencyNode[], group: Array<{ node: DependencyNode; mutant: Mutant }>): boolean {
  for (const dependency of dependencies) {
    for (const node of group) {
      if (node.node === dependency) {
        return true;
      }
    }
  }

  return false;
}
