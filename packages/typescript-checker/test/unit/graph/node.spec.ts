import { expect } from 'chai';

import { Node } from '../../../src/graph/node.js';

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
});
