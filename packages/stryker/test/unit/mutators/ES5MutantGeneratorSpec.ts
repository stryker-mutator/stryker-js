import { expect } from 'chai';
import { Syntax } from 'esprima';
import * as estree from 'estree';
import { Mutant } from 'stryker-api/mutant';
import { file, textFile } from '../../helpers/producers';
import ES5MutantGenerator from '../../../src/mutators/ES5MutantGenerator';
import Mutator from '../../../src/mutators/Mutator';
import { Identified, IdentifiedNode } from '../../../src/mutators/IdentifiedNode';

describe('ES5MutantGenerator', () => {
  let sut: ES5MutantGenerator;

  beforeEach(() => {
    sut = new ES5MutantGenerator();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return an empty array if nothing could be mutated', () => {
    const mutants = sut.generateMutants([textFile({ name: 'test.js', included: false, mutated: true, content: '' })]);
    expect(mutants.length).to.equal(0);
  });

  describe('with single input file with a one possible mutation', () => {
    let mutants: Mutant[];

    beforeEach(() => {
      mutants = sut.generateMutants([file({ content: 'var i = 1 + 2;' })]);
    });

    it('should return an array with a single mutant', () => {
      expect(mutants.length).to.equal(1);
    });

    it('should be able to mutate code', () => {
      expect(mutants[0].replacement).eq('1 - 2');
    });

    it('should set the range', () => {
      const originalCode = '\n\nvar i = 1 + 2;';
      mutants = sut.generateMutants([file({ content: originalCode })]);
      expect(mutants[0].range[0]).to.equal(10);
      expect(mutants[0].range[1]).to.equal(15);
    });
  });

  describe('should be able to handle a Mutator that returns', () => {

    class StubMutator implements Mutator {
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
      sut = new ES5MutantGenerator(undefined, [new StubMutator()]);
    });

    it('the same nodeID', () => {
      const mutants = sut.generateMutants([file({ name: 'some file', content: 'if (true);' })]);
      expect(mutants[0].fileName).eq('some file');
      expect(mutants[0].replacement).eq('if (true);');
    });

    it('a different nodeID', () => {
      const mutants = sut.generateMutants([file({ name: 'src.js', content: '1 * 2' })]);
      expect(mutants[0].fileName).eq('src.js');
      expect(mutants[0].replacement).eq('1');
    });
  });

});
