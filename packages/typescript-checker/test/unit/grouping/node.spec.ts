import { expect } from 'chai';

import { Mutant } from '@stryker-mutator/api/src/core';

import { Node } from '../../../src/grouping/node.js';

describe('node', () => {
  it('getAllParentReferencesIncludingSelf without parent should return array of 1 node ', () => {
    const node = new Node('NodeA', [], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(1);
  });

  it('getAllParentReferencesIncludingSelf with 1 parent should return array of 2 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(2);
  });

  it('getAllParentReferencesIncludingSelf with recursive depth of 2 should return 3 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [new Node('', [], [])], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(3);
  });

  it('getAllParentReferencesIncludingSelf with recursive depth of 2 and multiple parents should return 4 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [new Node('', [], []), new Node('', [], [])], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(4);
  });

  it('getAllParentReferencesIncludingSelf with circular dependency should skip circular dependency node ', () => {
    const nodeA = new Node('NodeA', [], []);
    const nodeC = new Node('NodeB', [nodeA], []);
    const nodeB = new Node('NodeB', [nodeC], []);
    nodeA.parents.push(nodeB);
    expect(nodeA.getAllParentReferencesIncludingSelf()).to.have.lengthOf(3);
  });

  it('getAllChildReferencesIncludingSelf without parent should return array of 1 node ', () => {
    const node = new Node('NodeA', [], []);
    expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(1);
  });

  it('getAllChildReferencesIncludingSelf with 1 child should return array of 2 nodes ', () => {
    const node = new Node('NodeA', [], [new Node('', [], [])]);
    expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(2);
  });

  it('getAllChildReferencesIncludingSelf with recursive depth of 2 should return 3 nodes ', () => {
    const node = new Node('NodeA', [], [new Node('', [], [new Node('', [], [])])]);
    expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(3);
  });

  it('getAllChildReferencesIncludingSelf with recursive depth of 2 and multiple parents should return 4 nodes ', () => {
    const node = new Node('NodeA', [], [new Node('', [], [new Node('', [], []), new Node('', [], [])])]);
    expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(4);
  });

  it('getMutantsWithReferenceToChildrenOrSelf with single mutant in file should return 1 mutant', () => {
    const node = new Node('NodeA.js', [], []);
    const mutants: Mutant[] = [
      { fileName: 'NodeA.js', id: '0', replacement: '-', location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } }, mutatorName: '' },
    ];
    expect(node.getMutantsWithReferenceToChildrenOrSelf(mutants)).to.have.lengthOf(1);
  });
});
