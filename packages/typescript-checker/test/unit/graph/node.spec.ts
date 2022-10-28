import { expect } from 'chai';

import { Node } from '../../../src/grouping/node.js';

describe('node', () => {
  it('getAllNodesToIgnore without parent should return array of 1 node ', () => {
    const node = new Node('NodeA', [], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(1);
  });

  it('getAllNodesToIgnore with 1 parent should return array of 2 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(2);
  });

  it('getAllNodesToIgnore with recursive depth of 2 should return 3 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [new Node('', [], [])], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(3);
  });

  it('getAllNodesToIgnore with recursive depth of 2 and multiple parents should return 4 nodes ', () => {
    const node = new Node('NodeA', [new Node('', [new Node('', [], []), new Node('', [], [])], [])], []);
    expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(4);
  });
});
