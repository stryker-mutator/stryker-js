'use strict';

var expect = require('chai').expect;
var BaseOperatorMutation = require('../../../src/mutations/BaseOperatorMutation');
var Mutant = require('../../../src/Mutant');
var ParserUtils = require('../../../src/utils/ParserUtils');
require('mocha-sinon');

describe('BaseOperatorMutation', function() {
  describe('should throw an error', function() {
    it('if the parameter name is not provided', function() {
      expect(function() {
        new BaseOperatorMutation();
      }).to.throw(Error);
    });

    it('if the parameter operators is not provided', function() {
      expect(function() {
        new BaseOperatorMutation('name');
      }).to.throw(Error);
    });

    it('if the parameter types is not provided', function() {
      expect(function() {
        new BaseOperatorMutation('name', {
          'op': 'po'
        });
      }).to.throw(Error);
    });
  });

  describe('should recognize', function() {
    it('one of its own mutation operators as a part of its mutation', function() {
      var node = {
        type: 'SomeType',
        operator: '+'
      };
      var baseOperatorMutation = new BaseOperatorMutation('name', ['SomeOtherType', node.type], {
        '+': '-'
      });

      var recognized = baseOperatorMutation.canMutate(node);

      expect(recognized).to.equal(true);
    });
  });

  describe('should not recognize', function() {
    it('an unknown mutation operator', function() {
      var node = {
        type: 'SomeType',
        operator: 'some operator which should not be known to the BaseOperatorMutation'
      };
      var baseOperatorMutation = new BaseOperatorMutation('name', [node.type], {
        '+': '-'
      });

      var recognized = baseOperatorMutation.canMutate(node);

      expect(recognized).to.equal(false);
    });

    it('a node with a different type', function() {
      var node = {
        type: 'SomeDifferentType',
        operator: '+'
      };
      var baseOperatorMutation = new BaseOperatorMutation('name', ['SomeType'], {
        '+': '-'
      });

      var recognized = baseOperatorMutation.canMutate(node);

      expect(recognized).to.equal(false);
    });
  });

  it('should set the correct column number', function() {
    this.sinon.stub(Mutant.prototype, 'save');
    var code = 'var i = 5 * 3;';
    var column = 11;
    var baseOperatorMutation = new BaseOperatorMutation('name', ['SomeType'], {
      '*': '/'
    });
    var parserUtils = new ParserUtils();
    var ast = parserUtils.parse(code);
    var node = ast.body[0].declarations[0].init;
    var mutants = baseOperatorMutation.applyMutation('hello.js', code, node, ast);
    var actualColumn = mutants[0].getColumnNumber();

    expect(actualColumn).to.equal(column);
  });
});
