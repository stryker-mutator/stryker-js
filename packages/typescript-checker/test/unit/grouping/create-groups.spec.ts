import { expect } from 'chai';

import { factory } from '@stryker-mutator/test-helpers';

import { TSFileNode } from '../../../src/grouping/node.js';

import { createGroups } from '../../../src/grouping/create-groups.js';

describe('create-group createGroups', () => {
  it('single mutant should create single group', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: 'mutant-1' })];
    const nodes = new Map<string, TSFileNode>([['a.js', new TSFileNode('a.js', [], [])]]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0]).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal('mutant-1');
  });

  it('two mutants in different files without reference to each other should create single group', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodes = new Map<string, TSFileNode>([
      ['a.js', new TSFileNode('a.js', [], [])],
      ['b.js', new TSFileNode('b.js', [], [])],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[0][1]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in different files with reference to each other should create 2 groups', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in different files with circular dependency to each other should create 2 groups', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    nodeA.parents.push(nodeB);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in same file should create 2 groups', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'a.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new TSFileNode('a.js', [], []);
    const nodes = new Map<string, TSFileNode>([[nodeA.fileName, nodeA]]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('complex graph should contain multiples 4 groups', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
      factory.mutant({ fileName: 'c.js', id: '3' }),
      factory.mutant({ fileName: 'd.js', id: '4' }),
      factory.mutant({ fileName: 'e.js', id: '5' }),
      factory.mutant({ fileName: 'f.js', id: '6' }),
    ];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    const nodeC = new TSFileNode('c.js', [nodeA], []);
    const nodeD = new TSFileNode('d.js', [nodeC], []);
    const nodeE = new TSFileNode('e.js', [nodeA], []);
    const nodeF = new TSFileNode('f.js', [nodeE, nodeD], []);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
      [nodeC.fileName, nodeC],
      [nodeD.fileName, nodeD],
      [nodeE.fileName, nodeE],
      [nodeF.fileName, nodeF],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(4);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
    expect(groups[1][1]).to.be.equal(mutantsClone[2].id);
    expect(groups[1][2]).to.be.equal(mutantsClone[4].id);
    expect(groups[2][0]).to.be.equal(mutantsClone[3].id);
    expect(groups[3][0]).to.be.equal(mutantsClone[5].id);
  });
});
