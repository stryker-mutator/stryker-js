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

  const groups: Mutant[][] = [];

  let mutant: Mutant | null = selectNewMutant(mutans, groups);

  while (mutant != null) {
    const mutantCopy = [...mutants];
    const group: Mutant[] = [mutant];
    const node = mutantSelectorHelper.selectNode(mutant.fileName);
    
    if (node === null) throw new Error('Node not in graph');

    const nodesToIgnore: Set<Node> = node.getAllParentReferencesIncludingSelf();

    for (const mutantSelected of mutantCopy) {
      
    }

    
    
    groups.push(group);
    mutant = selectNewMutant(mutans, groups);
  }

  return graph;
}

function createTempMutants(): Mutant[]{
  return [
    {fileName: 'A.js', replacement: '', id: '1', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'B.js', replacement: '', id: '2', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'C.js', replacement: '', id: '3', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'D.js', replacement: '', id: '4', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'A.js', replacement: '', id: '5', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
  ]
}

function selectNewMutant(mutans: Mutants[], groups: Mutant[][]): Mutant | null {
  throw new Error('Function not implemented.');
}
