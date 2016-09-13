import * as _ from 'lodash';
import RemoveConditionalsMutator from '../../../src/mutators/RemoveConditionalsMutator';
import * as parserUtils from '../../../src/utils/parserUtils';
import * as chai from 'chai';
import * as estree from 'estree';
let expect = chai.expect;

describe('RemoveConditionalsMutator', function () {
  let removeConditionalsMutator: RemoveConditionalsMutator;
  let doWhileLoop: estree.DoWhileStatement;
  let forLoop: estree.ForStatement;
  let whileLoop: estree.WhileStatement;
  let ifStatement: estree.IfStatement;

  beforeEach(function () {
    removeConditionalsMutator = new RemoveConditionalsMutator();
    let code =
      `var price = 99.95;
    if(price > 25){
      console.log("Too expensive");
    }
    while(price > 50){
      price = price * 0.25;
    }
    do {
      console.log("I\'m sorry. The price is still too high");
      price = price - 5;
    } while(price > 30);
    for(var i = 0; i < 10; i++) {
      console.log("I would like to buy the item");
    }`;

    let ast = parserUtils.parse(code);
    ifStatement = <estree.IfStatement>ast.body[1];
    whileLoop = <estree.WhileStatement>ast.body[2];
    doWhileLoop = <estree.DoWhileStatement>ast.body[3];
    forLoop = <estree.ForStatement>ast.body[4];
  });

  function applyMutation(node: estree.IfStatement | estree.DoWhileStatement | estree.WhileStatement | estree.ForStatement) {
    return removeConditionalsMutator.applyMutations(node, _.cloneDeep);
  }

  describe('should not generate an infinite loop', function () {
    it('when given a do-while loop', function () {
      let mutatedNodes = applyMutation(doWhileLoop);
      let testValue = (<estree.Literal>mutatedNodes[0]).value;

      expect(testValue).to.be.false;
    });

    it('when given a while loop', function () {
      let mutatedNodes = applyMutation(whileLoop);
      let testValue = (<estree.Literal>mutatedNodes[0]).value;

      expect(testValue).to.be.false;
    });

    it('when given a for loop', function () {
      let mutatedNodes = applyMutation(forLoop);
      let testValue = (<estree.Literal>mutatedNodes[0]).value;

      expect(testValue).to.be.false;
    });
  });

  describe('should generate a single mutant', function () {
    it('when given a do-while loop', function () {
      let mutatedNodes = applyMutation(doWhileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a while loop', function () {
      let mutatedNodes = applyMutation(whileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a for loop', function () {
      let mutatedNodes = applyMutation(forLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });

  describe('should generate multiple mutants', function () {
    it('when given an if-statement', function () {
      let mutatedNodes = applyMutation(ifStatement);

      expect(mutatedNodes).to.have.length.above(1);
    });
  });
});
