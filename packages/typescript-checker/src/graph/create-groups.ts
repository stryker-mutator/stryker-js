/* eslint-disable */
import { Mutant } from '@stryker-mutator/api/src/core/index.js';

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

const graph: Node = createTempGraph();

export function createGroups(mutants: Mutant[], nodes: Node[]): Promise<string[][]> {
  const mutantSelector: MutantSelectorHelpers = new MutantSelectorHelpers(mutants, nodes);

  let mutant: Mutant | null = mutantSelector.getNewMutant();

  while (mutant != null) {


    mutant = mutantSelector.getNewMutant();
  }

  const negeerlijst: Node[];
  const groep: Node[];

  const leaf = getLeaf(graph, negeerlijst);

  return graph;
}

class MutantSelectorHelpers {
  constructor(private mutants: Mutant[], nodes: Node[]) {};

  public getNewMutant(): Mutant | null {
    return null;
  }

  public selectNode(mutant: Mutant) {
    
  }
}

function getNewMutant(mutants: Mutant[]) {
  throw new Error('Function not implemented.');
}

