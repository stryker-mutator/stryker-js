import RemoveConditionalsMutator from '../../../src/mutators/RemoveConditionalsMutator';
import * as parserUtils from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';
import * as chai from 'chai';
import * as estree from 'estree';

let expect = chai.expect;

describe('RemoveConditionalsMutator', function () {
  let sut: RemoveConditionalsMutator;
  let doWhileLoop: estree.DoWhileStatement;
  let forLoop: estree.ForStatement;
  let whileLoop: estree.WhileStatement;
  let ifStatement: estree.IfStatement;
  let ternaryExpression: estree.ConditionalExpression;

  beforeEach(function () {
    sut = new RemoveConditionalsMutator();
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
    }
    price < 20? 40 : 10;
    `;

    const ast = parserUtils.parse(code);
    parserUtils.collectFrozenNodes(ast);
    ifStatement = <estree.IfStatement>ast.body[1];
    whileLoop = <estree.WhileStatement>ast.body[2];
    doWhileLoop = <estree.DoWhileStatement>ast.body[3];
    forLoop = <estree.ForStatement>ast.body[4];
    ternaryExpression = (ast.body[5] as estree.ExpressionStatement).expression as estree.ConditionalExpression;
  });

  function actMutator(node: estree.IfStatement | estree.DoWhileStatement | estree.WhileStatement | estree.ForStatement | estree.ConditionalExpression) {
    const mutants = sut.applyMutations(node, copy);
    if (Array.isArray(mutants)) {
      return <estree.SimpleLiteral[]> mutants;
    } else {
      return [];
    }
  }

  describe('should not generate an infinite loop', function () {
    it('when given a do-while loop', function () {
      const mutatedNodes = actMutator(doWhileLoop);

      const testValue = (<estree.Literal>mutatedNodes[0]).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(doWhileLoop.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(doWhileLoop.test.nodeID);
    });

    it('when given a while loop', function () {
      const mutatedNodes = actMutator(whileLoop);

      const testValue = (<estree.Literal>mutatedNodes[0]).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(whileLoop.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(whileLoop.test.nodeID);
    });

    it('when given a for loop', function () {
      let mutatedNodes = actMutator(forLoop);

      let testValue = (<estree.Literal>mutatedNodes[0]).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(forLoop.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(forLoop.test.nodeID);
    });
  });

  describe('should generate a single mutant', function () {
    it('when given a do-while loop', function () {
      let mutatedNodes = actMutator(doWhileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a while loop', function () {
      let mutatedNodes = actMutator(whileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a for loop', function () {
      let mutatedNodes = actMutator(forLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });

  describe('should generate multiple mutants', function () {
    it('when given an if-statement', function () {
      let mutatedNodes = actMutator(ifStatement);

      expect(mutatedNodes).to.have.length(2);
      expect(mutatedNodes[0].nodeID).not.to.eq(ifStatement.nodeID);
      expect(mutatedNodes[1].nodeID).not.to.eq(ifStatement.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(ifStatement.test.nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(ifStatement.test.nodeID);
      expect(mutatedNodes[0].value).to.be.false;
      expect(mutatedNodes[1].value).to.be.true;
    });

    it('when given a ternary-statement', () => {
      let mutatedNodes = actMutator(ternaryExpression);

      expect(mutatedNodes).to.have.length(2);
      expect(mutatedNodes[0].nodeID).not.to.eq(ternaryExpression.nodeID);
      expect(mutatedNodes[1].nodeID).not.to.eq(ternaryExpression.nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(ternaryExpression.test.nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(ternaryExpression.test.nodeID);
      expect(mutatedNodes[0].value).to.be.false;
      expect(mutatedNodes[1].value).to.be.true;
    });
  });
});
