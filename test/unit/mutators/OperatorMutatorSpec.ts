import * as _ from 'lodash';
import OperatorMutator from '../../../src/mutators/OperatorMutator';
import * as chai from 'chai';
import * as estree from 'stryker-api/estree';
let expect = chai.expect;

describe('OperatorMutator', () => {
  class MockOperatorMutator extends OperatorMutator {
    constructor(){super('Mock', ['SomeType', 'BinaryExpression'], {
      '+': '-',
      '*': '/'
    });
    }
  }
  
  let mockMutator: OperatorMutator;
  let invalidNode: estree.Node;
  let validNode: estree.Node;
  
  beforeEach(() => {
    mockMutator = new MockOperatorMutator();
    invalidNode = <estree.Node> {
      type: 'Identifier',
    };
    validNode = <estree.BinaryExpression> {
      nodeID: 23,
      type: 'BinaryExpression',
      operator: '+',
      left: <estree.Literal> {
        type: "Literal",
        value: 6,
        raw: "6"
      },
      right:<estree.Literal> {
        type: "Literal",
        value: 7,
        raw: "7"
      }
    };
  });
  
  describe('should mutate', () => {
    it('a valid Node', () => {
      let mutatedNodes = mockMutator.applyMutations(validNode, _.cloneDeep);
      
      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });
  
  describe('should not mutate', () => {
    it('an invalid Node', () => {
      let mutatedNodes = mockMutator.applyMutations(invalidNode, _.cloneDeep);
      
      expect(mutatedNodes).to.have.lengthOf(0);
    });
  });
});
