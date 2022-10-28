/* eslint-disable */
import { Mutant } from '@stryker-mutator/api/src/core/index.js';
import { group } from 'console';
import { findNode, MutantSelectorHelpers } from './mutant-selector-helpers.js';

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
  const groups: Mutant[][] = [];

  let mutant: Mutant | null = selectNewMutant(mutants, groups);

  // Loop unil all the mutants are in a group
  while (mutant != null) {
    // Copy the list of mutants who are not in a group
    const mutantWhoAreNotInAGroup = [...mutants];
    // The first mutant is always in a group
    const group: Mutant[] = [mutant];
    const node = findNode(mutant.fileName, nodes);

    if (node === null) throw new Error('Node not in graph');

    // Fill the ignorelist
    let nodesToIgnore: Set<Node> = new Set(node.getAllParentReferencesIncludingSelf());

    // Loop through the nodes who can possibly go in the group
    for (const mutantSelected of mutantWhoAreNotInAGroup) {
      let nodeSelected = findNode(mutantSelected.fileName, nodes);

      if (nodeSelected === null) throw new Error('Node not in graph');

      // See if the node can be in the group
      if (nodesToIgnore.has(nodeSelected)) continue;

      // Push the group
      group.push(mutantSelected);
      // Add to the ignorelist
      nodesToIgnore = new Set<Node>([...nodesToIgnore, ...nodeSelected.getAllParentReferencesIncludingSelf()]);
    }

    groups.push(group);
    mutant = selectNewMutant(mutants, groups);
  }

  return Promise.resolve(groupsToString(groups));
}

function createTempMutants(): Mutant[] {
  return [
    {fileName: 'A.js', replacement: '', id: '1', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'B.js', replacement: '', id: '2', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'C.js', replacement: '', id: '3', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'D.js', replacement: '', id: '4', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
    {fileName: 'A.js', replacement: '', id: '5', location: {start: {line:1, column:1}, end: {line:1, column:1}}, mutatorName: 'test'},
  ]
}

function selectNewMutant(mutants: Mutant[], groups: Mutant[][]): Mutant | null {
  const flatGroups = groups.flat();

  for (let i = 0; i < mutants.length; i++) {
    if (!flatGroups.includes(mutants[i])) {
      mutants.splice(i, 1)
      return mutants[i];
    }
  }

  return null;
}

function groupsToString(groups: Mutant[][]): string[][] {
  return groups.map(group => group.map(mutant => mutant.fileName));
}

