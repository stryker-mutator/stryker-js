import { expect } from 'chai';

import { Mutant } from '@stryker-mutator/api/src/core';

import { TSFileNode } from '../../../src/grouping/ts-file-node.js';

describe('TSFileNode', () => {
  describe(TSFileNode.prototype.getAllParentReferencesIncludingSelf.name, () => {
    it('getAllParentReferencesIncludingSelf without parent should return array of 1 node ', () => {
      const node = new TSFileNode('NodeA', [], []);
      expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(1);
    });

    it('getAllParentReferencesIncludingSelf with 1 parent should return array of 2 nodes ', () => {
      const node = new TSFileNode('NodeA', [new TSFileNode('', [], [])], []);
      expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(2);
    });

    it('getAllParentReferencesIncludingSelf with recursive depth of 2 should return 3 nodes ', () => {
      const node = new TSFileNode('NodeA', [new TSFileNode('', [new TSFileNode('', [], [])], [])], []);
      expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(3);
    });

    it('getAllParentReferencesIncludingSelf with recursive depth of 2 and multiple parents should return 4 nodes ', () => {
      const node = new TSFileNode('NodeA', [new TSFileNode('', [new TSFileNode('', [], []), new TSFileNode('', [], [])], [])], []);
      expect(node.getAllParentReferencesIncludingSelf()).to.have.lengthOf(4);
    });

    it('getAllParentReferencesIncludingSelf with circular dependency should skip circular dependency node ', () => {
      const nodeA = new TSFileNode('NodeA', [], []);
      const nodeC = new TSFileNode('NodeB', [nodeA], []);
      const nodeB = new TSFileNode('NodeB', [nodeC], []);
      nodeA.parents.push(nodeB);
      expect(nodeA.getAllParentReferencesIncludingSelf()).to.have.lengthOf(3);
    });
  });

  describe(TSFileNode.prototype.getAllChildReferencesIncludingSelf.name, () => {
    it('getAllChildReferencesIncludingSelf without parent should return array of 1 node ', () => {
      const node = new TSFileNode('NodeA', [], []);
      expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(1);
    });

    it('getAllChildReferencesIncludingSelf with 1 child should return array of 2 nodes ', () => {
      const node = new TSFileNode('NodeA', [], [new TSFileNode('', [], [])]);
      expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(2);
    });

    it('getAllChildReferencesIncludingSelf with recursive depth of 2 should return 3 nodes ', () => {
      const node = new TSFileNode('NodeA', [], [new TSFileNode('', [], [new TSFileNode('', [], [])])]);
      expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(3);
    });

    it('getAllChildReferencesIncludingSelf with recursive depth of 2 and multiple parents should return 4 nodes ', () => {
      const node = new TSFileNode('NodeA', [], [new TSFileNode('', [], [new TSFileNode('', [], []), new TSFileNode('', [], [])])]);
      expect(node.getAllChildReferencesIncludingSelf()).to.have.lengthOf(4);
    });
  });

  describe(TSFileNode.prototype.getMutantsWithReferenceToChildrenOrSelf.name, () => {
    it('getMutantsWithReferenceToChildrenOrSelf with single mutant in file should return 1 mutant', () => {
      const node = new TSFileNode('NodeA.js', [], []);
      const mutants: Mutant[] = [
        {
          fileName: 'NodeA.js',
          id: '0',
          replacement: '-',
          location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
          mutatorName: '',
        },
      ];
      expect(node.getMutantsWithReferenceToChildrenOrSelf(mutants)).to.have.lengthOf(1);
    });

    it('getMutantsWithReferenceToChildrenOrSelf with single mutant in child should return 1 mutant', () => {
      const node = new TSFileNode('NodeA.js', [], []);
      const nodeB = new TSFileNode('NodeB.js', [], []);
      node.children.push(nodeB);
      const mutants: Mutant[] = [
        {
          fileName: 'NodeB.js',
          id: '0',
          replacement: '-',
          location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
          mutatorName: '',
        },
      ];
      expect(node.getMutantsWithReferenceToChildrenOrSelf(mutants)).to.have.lengthOf(1);
    });

    it('should not create endless loop', () => {
      const node = new TSFileNode('NodeA.js', [], []);
      node.children = [node];

      const mutants: Mutant[] = [
        {
          fileName: 'NodeA.js',
          id: '0',
          replacement: '-',
          location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
          mutatorName: '',
        },
      ];

      expect(node.getMutantsWithReferenceToChildrenOrSelf(mutants)).to.have.lengthOf(1);
    });

    it('should find mutant with backward slashes and forward slashes', () => {
      const node = new TSFileNode('path/NodeA.js', [], []);
      node.children = [node];

      const mutants: Mutant[] = [
        {
          fileName: 'path/NodeA.js',
          id: '0',
          replacement: '-',
          location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
          mutatorName: '',
        },
        {
          fileName: 'path\\NodeA.js',
          id: '0',
          replacement: '-',
          location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
          mutatorName: '',
        },
      ];

      expect(node.getMutantsWithReferenceToChildrenOrSelf(mutants)).to.have.lengthOf(2);
    });
  });
});
