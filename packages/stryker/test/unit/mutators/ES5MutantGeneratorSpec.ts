import { expect } from 'chai';
import { Syntax } from 'esprima';
import * as estree from 'estree';
import { Mutant } from 'stryker-api/mutant';
import ES5Mutator from '../../../src/mutators/ES5Mutator';
import NodeMutator from '../../../src/mutators/NodeMutator';
import { Identified, IdentifiedNode } from '../../../src/mutators/IdentifiedNode';
import { File } from 'stryker-api/core';

describe('ES5Mutator', () => {
  let sut: ES5Mutator;

  beforeEach(() => {
    sut = new ES5Mutator();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('with single input file with a one possible mutation', () => {
    let mutants: Mutant[];

    beforeEach(() => {
      mutants = sut.mutate([new File('', 'var i = 1 + 2;')]);
    });

    it('should return an array with a single mutant', () => {
      expect(mutants.length).to.equal(1);
    });

    it('should be able to mutate code', () => {
      expect(mutants[0].replacement).eq('1 - 2');
    });

    it('should set the range', () => {
      const originalCode = '\n\nvar i = 1 + 2;';
      mutants = sut.mutate([new File('', originalCode)]);
      expect(mutants[0].range[0]).to.equal(10);
      expect(mutants[0].range[1]).to.equal(15);
    });
  });

  describe('should be able to handle a Mutator that returns', () => {

    class StubMutator implements NodeMutator {
      name: 'stub';
      applyMutations(node: IdentifiedNode, copy: (obj: any, deep?: boolean) => any): IdentifiedNode[] {
        let nodes: IdentifiedNode[] = [];
        if (node.type === Syntax.BinaryExpression) {
          // eg: '1 * 2': push child node
          nodes.push((node as estree.BinaryExpression).left as estree.Expression & Identified);
        } else if (node.type === Syntax.IfStatement) {
          // eg: 'if(true);': push original node
          nodes.push(node);
        }
        return nodes;
      }
    }

    beforeEach(() => {
      sut = new ES5Mutator(undefined, [new StubMutator()]);
    });

    it('the same nodeID', () => {
      const mutants = sut.mutate([new File('some file', 'if (true);')]);
      expect(mutants[0].fileName).eq('some file');
      expect(mutants[0].replacement).eq('if (true);');
    });

    it('a different nodeID', () => {
      const mutants = sut.mutate([new File('src.js', '1 * 2')]);
      expect(mutants[0].fileName).eq('src.js');
      expect(mutants[0].replacement).eq('1');
    });
  });

});
