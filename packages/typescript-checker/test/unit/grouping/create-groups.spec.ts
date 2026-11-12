import { expect } from 'chai';
import sinon from 'sinon';

import { factory } from '@stryker-mutator/test-helpers';

import { TSFileNode } from '../../../src/grouping/ts-file-node.js';

import { createGroups } from '../../../src/grouping/create-groups.js';

describe(createGroups.name, () => {
  it('single mutant should create single group', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: 'mutant-1' })];
    const nodes = new Map<string, TSFileNode>([
      ['a.js', new TSFileNode('a.js', [], [])],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0]).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal('mutant-1');
  });

  it('two mutants in different files without reference to each other should create single group', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
    ];
    const nodes = new Map<string, TSFileNode>([
      ['a.js', new TSFileNode('a.js', [], [])],
      ['b.js', new TSFileNode('b.js', [], [])],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(1);
    expect(groups[0][0]).to.be.equal('1');
    expect(groups[0][1]).to.be.equal('2');
  });

  it('two mutants in different files with reference to each other should create 2 groups', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
    ];
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal('1');
    expect(groups[1][0]).to.be.equal('2');
  });

  it('two mutants in different files with circular dependency to each other should create 2 groups', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
    ];
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    nodeA.parents.push(nodeB);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal('1');
    expect(groups[1][0]).to.be.equal('2');
  });

  it('two mutants in same file should create 2 groups', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'a.js', id: '2' }),
    ];
    const nodeA = new TSFileNode('a.js', [], []);
    const nodes = new Map<string, TSFileNode>([[nodeA.fileName, nodeA]]);
    const groups = createGroups(mutants, nodes);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0][0]).to.be.equal('1');
    expect(groups[1][0]).to.be.equal('2');
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
    expect(groups[0][0]).to.be.equal('1');
    expect(groups[1][0]).to.be.equal('2');
    expect(groups[1][1]).to.be.equal('3');
    expect(groups[1][2]).to.be.equal('5');
    expect(groups[2][0]).to.be.equal('4');
    expect(groups[3][0]).to.be.equal('6');
  });

  it('should group mutants of the same files that are not adjacent', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
      factory.mutant({ fileName: 'c.js', id: '3' }),
      factory.mutant({ fileName: 'b.js', id: '4' }),
      factory.mutant({ fileName: 'a.js', id: '5' }),
      factory.mutant({ fileName: 'c.js', id: '6' }),
    ];
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [nodeA], []);
    const nodeC = new TSFileNode('c.js', [], []);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
      [nodeC.fileName, nodeC],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).deep.eq([['1', '3'], ['2', '6'], ['4'], ['5']]);
  });

  it('should keep a mutant out of a larger group that holds a file importing its file', () => {
    const mutants = [
      factory.mutant({ fileName: 'p.js', id: '1' }),
      factory.mutant({ fileName: 'q.js', id: '2' }),
      factory.mutant({ fileName: 'r.js', id: '3' }),
      factory.mutant({ fileName: 'x.js', id: '4' }),
    ];
    const nodeP = new TSFileNode('p.js', [], []);
    const nodeQ = new TSFileNode('q.js', [], []);
    const nodeR = new TSFileNode('r.js', [], []);
    const nodeX = new TSFileNode('x.js', [nodeP], []);
    nodeP.children.push(nodeX);
    const nodes = new Map<string, TSFileNode>([
      [nodeP.fileName, nodeP],
      [nodeQ.fileName, nodeQ],
      [nodeR.fileName, nodeR],
      [nodeX.fileName, nodeX],
    ]);
    const groups = createGroups(mutants, nodes);
    expect(groups).deep.eq([['1', '2', '3'], ['4']]);
  });

  it('should look up the files that import a file once per file', () => {
    const mutants = [
      factory.mutant({ fileName: 'a.js', id: '1' }),
      factory.mutant({ fileName: 'b.js', id: '2' }),
      factory.mutant({ fileName: 'a.js', id: '3' }),
      factory.mutant({ fileName: 'b.js', id: '4' }),
      factory.mutant({ fileName: 'a.js', id: '5' }),
    ];
    const nodeA = new TSFileNode('a.js', [], []);
    const nodeB = new TSFileNode('b.js', [], []);
    const nodes = new Map<string, TSFileNode>([
      [nodeA.fileName, nodeA],
      [nodeB.fileName, nodeB],
    ]);
    const parentReferencesOfA = sinon.spy(
      nodeA,
      'getAllParentReferencesIncludingSelf',
    );
    const parentReferencesOfB = sinon.spy(
      nodeB,
      'getAllParentReferencesIncludingSelf',
    );

    const groups = createGroups(mutants, nodes);

    expect(groups).deep.eq([['1', '2'], ['3', '4'], ['5']]);
    sinon.assert.calledOnce(parentReferencesOfA);
    sinon.assert.calledOnce(parentReferencesOfB);
  });

  it('should throw error when not is not in graph', () => {
    const mutants = [factory.mutant({ fileName: 'a.js', id: '1' })];
    const nodeA = new TSFileNode('.js', [], []);
    const nodes = new Map<string, TSFileNode>([[nodeA.fileName, nodeA]]);

    expect(createGroups.bind(null, mutants, nodes)).throw(
      'Node not in graph: a.js',
    );
  });
});
