import * as _ from 'lodash';
import BinaryOperatorMutator from '../../../src/mutators/BinaryOperatorMutator';
import * as chai from 'chai';
import * as estree from 'estree';
let expect = chai.expect;

describe('BinaryOperatorMutator', () => {
  let mutator: BinaryOperatorMutator;
  let invalidNode: estree.Node;
  let validNode: estree.Node;

  beforeEach(() => {
    mutator = new BinaryOperatorMutator();
    invalidNode = <estree.Node>{
      type: 'Identifier',
    };
    validNode = <estree.BinaryExpression>{
      nodeID: 23,
      type: 'BinaryExpression',
      operator: '+',
      left: <estree.Literal>{
        type: 'Literal',
        value: 6,
        raw: '6'
      },
      right: <estree.Literal>{
        type: 'Literal',
        value: 7,
        raw: '7'
      }
    };
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
