import OperatorMutator from '../../../src/mutators/OperatorMutator';
import * as chai from 'chai';
let expect = chai.expect;

describe('OperatorMutator', () => {
  class MockOperatorMutator extends OperatorMutator {
    constructor(){super('Mock', ['SomeType', 'SomeOtherType'], {
      '+': '-',
      '*': '/'
    });
    }
  }
  
  let mockMutator: OperatorMutator;
  let invalidNode: ESTree.Node;
  let validNode: ESTree.Node;
  
  beforeEach(() => {
    mockMutator = new MockOperatorMutator();
    invalidNode = <ESTree.Node> {
      type: 'SomeType',
    };
    validNode = <ESTree.BinaryExpression> {
      type: 'SomeType',
      operator: '+',
      left: <ESTree.Literal> {
        type: "Literal",
        value: 6,
        raw: "6"
      },
      right:<ESTree.Literal> {
        type: "Literal",
        value: 7,
        raw: "7"
      }
    };
  });
  
  describe('should mutate', () => {
    it('a valid Node', () => {
      let mutatedNodes = mockMutator.applyMutations(validNode);
      
      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });
  
  describe('should not mutate', () => {
    it('an invalid Node', () => {
      let mutatedNodes = mockMutator.applyMutations(invalidNode);
      
      expect(mutatedNodes).to.have.lengthOf(0);
    });
  });
});
