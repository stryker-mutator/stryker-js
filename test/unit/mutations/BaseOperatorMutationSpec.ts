'use strict';

var expect = require('chai').expect;
import BaseOperatorMutation from '../../../src/mutations/BaseOperatorMutation';
import Mutant from '../../../src/Mutant';
import ParserUtils from '../../../src/utils/ParserUtils';
require('mocha-sinon');

describe('BaseOperatorMutation', function() {
  class MockBaseOperatorMutation extends BaseOperatorMutation {
    constructor(){super('Mock', ['SomeType', 'SomeOtherType'], {
      '+': '-',
      '*': '/'
    });
    }
  }
  describe('should recognize', function() {
    it('one of its own mockMutation operators as a part of its mockMutation', function() {
      var expressionNode: ESTree.BinaryExpression  = {
        type: 'SomeType',
        operator: '+',
        left: null,
        right: null
      };
      
      var mockMutation = new MockBaseOperatorMutation();

      var recognized = mockMutation.canMutate(expressionNode);

      expect(recognized).to.equal(true);
    });
  });

  describe('should not recognize', function() {
    it('an unknown mockMutation operator', function() {
      var node: ESTree.BinaryExpression = {
        type: 'SomeType',
        operator: 'some operator which should not be known to the BaseOperatorMutation',
        left: null,
        right: null
      };
      
      var mockMutation = new MockBaseOperatorMutation();

      var recognized = mockMutation.canMutate(node);

      expect(recognized).to.equal(false);
    });

    it('a node with a different type', function() {
      var node: ESTree.BinaryExpression= {
        type: 'SomeDifferentType',
        operator: '+',
        left: null,
        right: null
      };
      
      var mockMutation = new MockBaseOperatorMutation();

      var recognized = mockMutation.canMutate(node);

      expect(recognized).to.equal(false);
    });
  });

  it('should set the correct column number', function() {
    this.sinon.stub(Mutant.prototype, 'save');
    var code = 'var i = 5 * 3;';
    var column = 11;
    var mockMutation = new MockBaseOperatorMutation();
    var parserUtils = new ParserUtils();
    var ast = parserUtils.parse(code);
    var node = ast.body[0].declarations[0].init;
    
    var mutants = mockMutation.applyMutation('hello.js', code, node, ast);
    var actualColumn = mutants[0].columnNumber;

    expect(actualColumn).to.equal(column);
  });
});
