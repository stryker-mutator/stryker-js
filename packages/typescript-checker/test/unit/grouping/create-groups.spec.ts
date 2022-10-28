import { expect } from 'chai';

import { factory } from '@stryker-mutator/test-helpers';

import { Node } from '../../../src/grouping/node.js';

import { createGroups } from '../../../src/grouping/create-groups.js';

describe('create-group createGroups', () => {
  it('single mutant should create single group', async () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' })];
    const mutantsClone = structuredClone(mutants);
    const nodes = [new Node('a.js', [], [])];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
  });

  it('two mutants in different files without reference to each other should create single group', async () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodes = [new Node('a.js', [], []), new Node('b.js', [], [])];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[0][1]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in different files with reference to each other should create 2 groups', async () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new Node('a.js', [], []);
    const nodeB = new Node('b.js', [nodeA], []);
    const nodes = [nodeA, nodeB];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in different files with circular dependency to each other should create 2 groups', async () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'b.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new Node('a.js', [], []);
    const nodeB = new Node('b.js', [nodeA], []);
    nodeA.parents.push(nodeB);
    const nodes = [nodeA, nodeB];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('two mutants in same file should create 2 groups', async () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' }), factory.mutant({ fileName: 'a.js', id: '2' })];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new Node('a.js', [], []);
    const nodes = [nodeA];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
  });

  it('complex graph should contain multiples 4 groups', async () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
      factory.mutant({ fileName: 'c.js', id: '3' }),
      factory.mutant({ fileName: 'd.js', id: '4' }),
      factory.mutant({ fileName: 'e.js', id: '5' }),
      factory.mutant({ fileName: 'f.js', id: '6' }),
    ];
    const mutantsClone = structuredClone(mutants);
    const nodeA = new Node('a.js', [], []);
    const nodeB = new Node('b.js', [nodeA], []);
    const nodeC = new Node('c.js', [nodeA], []);
    const nodeD = new Node('d.js', [nodeC], []);
    const nodeE = new Node('e.js', [nodeA], []);
    const nodeF = new Node('f.js', [nodeE, nodeD], []);
    const nodes = [nodeA, nodeB, nodeC, nodeD, nodeE, nodeF];
    const groups = await createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(4);
    expect(groups[0][0]).to.be.equal(mutantsClone[0].id);
    expect(groups[1][0]).to.be.equal(mutantsClone[1].id);
    expect(groups[1][1]).to.be.equal(mutantsClone[2].id);
    expect(groups[1][2]).to.be.equal(mutantsClone[4].id);
    expect(groups[2][0]).to.be.equal(mutantsClone[3].id);
    expect(groups[3][0]).to.be.equal(mutantsClone[5].id);
  });
});
