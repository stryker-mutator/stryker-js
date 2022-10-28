import { Mutant } from '@stryker-mutator/api/src/core/index.js';
import { Node } from './node.js';

function createTempGraph(): Node[] {
  const nodeA: Node = {
    parents: [],
    childs: [],
    fileName: 'A.js',
  };

  const nodeB: Node = {
    parents: [],
    childs: [],
    fileName: 'B.js',
  };

  const nodeC: Node = {
    parents: [],
    childs: [],
    fileName: 'C.js',
  };

  const nodeD: Node = {
    parents: [],
    childs: [],
    fileName: 'D.js',
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
  const mutantSelector = new MutantSelector(mutants);
  const mutant = getNewMutant(mutants);
  const negeerlijst: Node[];
  const groep: Node[];

  const leaf = getLeaf(graph, negeerlijst);

  return graph;
}

class MutantSelector {
  constructor(private mutants: Mutant[]) {};

  public getNewMutant(): Mutant {

  }
}

function getNewMutant(mutants: Mutant[]) {
  throw new Error('Function not implemented.');
}

