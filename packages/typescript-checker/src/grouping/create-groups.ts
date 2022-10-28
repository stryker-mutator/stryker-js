/* eslint-disable */
import { Mutant } from '@stryker-mutator/api/src/core/index.js';
import { group } from 'console';
import { MutantSelectorHelpers } from './mutant-selector-helpers.js';

import { Node } from './node.js';

function createTempGraph(): Node[] {
  const nodeA: Node = new Node('a.js', [], []);
  const nodeB: Node = new Node('b.js', [], []);
  const nodeC: Node = new Node('c.js', [], []);
  const nodeD: Node = new Node('d.js', [], []);

  nodeA.childs = [nodeB, nodeC];

  nodeB.parents = [nodeA];

  nodeC.childs = [nodeD];
  nodeC.parents = [nodeA];

  nodeD.parents = [nodeC];

  return [nodeA, nodeB, nodeC, nodeD];
}

function createTempMutents(): Node[] {
  const nodeA: Node = new Node('a.js', [], []);
  const nodeB: Node = new Node('b.js', [], []);
  const nodeC: Node = new Node('c.js', [], []);
  const nodeD: Node = new Node('d.js', [], []);

  nodeA.childs = [nodeB, nodeC];

  nodeB.parents = [nodeA];

  nodeC.childs = [nodeD];
  nodeC.parents = [nodeA];

  nodeD.parents = [nodeC];

  return [nodeA, nodeB, nodeC, nodeD];
}

export function createGroups(mutants: Mutant[], nodes: Node[]): Promise<string[][]> {
  const mutantSelectorHelper: MutantSelectorHelpers = new MutantSelectorHelpers(mutants, nodes);

  let mutant: Mutant | null = mutants.splice(0, 1)[0] ?? null;

  const groups: Mutant[][] = [];

  while (mutant != null) {
    const mutantCopy = [...mutants];
    const group: Mutant[] = [];
    const node = mutantSelectorHelper.selectNode(mutant.fileName);
    
    if (node === null) throw new Error('Node not in graph');
    
    const nodesToIgnore: Set<Node> = node.getAllParentReferencesIncludingSelf();
    
    groups.push(group);
    mutant = mutants.splice(0, 1)[0] ?? null;
  }

  return graph;
}

createGroups();
