/* eslint-disable */
import { Mutant } from '@stryker-mutator/api/src/core/index.js';
import { group } from 'console';
import { MutantSelectorHelpers } from './mutant-selector-helpers.js';

import { Node } from './node.js';

function createTempGraph(): Node[] {
  const nodeA: Node = {
    parents: [],
    childs: [],
    fileName: 'A.js',
    GetAllParentReferences() {
      return [];
    },
  };

  const nodeB: Node = {
    parents: [],
    childs: [],
    fileName: 'B.js',
    GetAllParentReferences() {
      return [];
    },
  };

  const nodeC: Node = {
    parents: [],
    childs: [],
    fileName: 'C.js',
    GetAllParentReferences() {
      return [];
    },
  };

  const nodeD: Node = {
    parents: [],
    childs: [],
    fileName: 'D.js',
    GetAllParentReferences() {
      return [];
    },
  };

  nodeA.childs = [nodeB, nodeC];

  nodeB.parents = [nodeA];

  nodeC.childs = [nodeD];
  nodeC.parents = [nodeA];

  nodeD.parents = [nodeC];

  return [nodeA, nodeB, nodeC, nodeD];
}

export function createGroups(mutants: Mutant[], nodes: Node[]): Promise<string[][]> {
  const mutantSelectorHelper: MutantSelectorHelpers = new MutantSelectorHelpers(mutants, nodes);

  let mutant: Mutant | null = mutantSelectorHelper.getNewMutant();

  const groups: Mutant[][] = [];

  while (mutant != null) {
    const group: Mutant = [];
    const node = mutantSelectorHelper.selectNode(mutant.fileName);
    
    if (node === null) throw new Error('Node not in graph');
    
    const negeerlijst: Set<Node> = node.GetAllParentReferences();
    
    groups.push(group);
    mutant = mutantSelectorHelper.getNewMutant();
  }

  const leaf = getLeaf(graph, negeerlijst);

  return graph;
}


