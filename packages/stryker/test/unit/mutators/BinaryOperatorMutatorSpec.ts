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
      left: {
        nodeID: -1,
        raw: '6',
        type: 'Literal',
        value: typeof 6
      } as estree.SimpleLiteral,
      nodeID: 23,
      operator: '+',
      right: {
        nodeID: -2,
        raw: '7',
        type: 'Literal',
        value: typeof 7
      },
      type: 'BinaryExpression'
    } as estree.BinaryExpression & Identified;
  });

  describe('should mutate', () => {
    it('a valid Node', () => {
      const mutatedNodes = mutator.applyMutations(validNode, _.cloneDeep);

      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });

  describe('should not mutate', () => {
    it('an invalid Node', () => {
      const mutatedNodes = mutator.applyMutations(invalidNode, _.cloneDeep);

      expect(mutatedNodes).to.have.lengthOf(0);
    });
  });
});
