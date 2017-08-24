import { expect } from 'chai';
import * as estree from 'estree';
import * as _ from 'lodash';
import BinaryOperatorMutator from '../../../src/mutators/BinaryOperatorMutator';
import { Identified, IdentifiedNode } from '../../../src/mutators/IdentifiedNode';

describe('BinaryOperatorMutator', () => {
  let mutator: BinaryOperatorMutator;
  let invalidNode: IdentifiedNode;
  let validNode: IdentifiedNode;

  beforeEach(() => {
    mutator = new BinaryOperatorMutator();
    invalidNode = {
      type: 'Identifier',
    } as estree.Node & Identified;
    validNode = {
      nodeID: 23,
      type: 'BinaryExpression',
      operator: '+',
      left: <estree.SimpleLiteral>{
        nodeID: -1,
        type: 'Literal',
        value: typeof 6,
        raw: '6'
      },
      right: {
        nodeID: -2,
        type: 'Literal',
        value: typeof 7,
        raw: '7'
      }
    } as estree.BinaryExpression & Identified;
  });

  describe('should mutate', () => {
    it('a valid Node', () => {
      let mutatedNodes = mutator.applyMutations(validNode, _.cloneDeep);

      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });

  describe('should not mutate', () => {
    it('an invalid Node', () => {
      let mutatedNodes = mutator.applyMutations(invalidNode, _.cloneDeep);

      expect(mutatedNodes).to.have.lengthOf(0);
    });
  });
});
