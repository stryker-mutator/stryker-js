import * as chai from 'chai';
import { Syntax } from 'esprima';
import * as estree from 'estree';
import { Identified, IdentifiedNode } from '../../../src/mutators/IdentifiedNode';
import RemoveConditionalsMutator from '../../../src/mutators/RemoveConditionalsMutator';
import { NodeIdentifier, parse, identified } from '../../../src/utils/parserUtils';
import { copy } from '../../../src/utils/objectUtils';

const expect = chai.expect;

describe('RemoveConditionalsMutator', () => {
  let sut: RemoveConditionalsMutator;
  let doWhileLoop: estree.DoWhileStatement & Identified;
  let forLoop: estree.ForStatement & Identified;
  let infiniteForLoop: estree.ForStatement & Identified;
  let whileLoop: estree.WhileStatement & Identified;
  let ifStatement: estree.IfStatement & Identified;
  let ternaryExpression: estree.ConditionalExpression & Identified;

  beforeEach(() => {
    sut = new RemoveConditionalsMutator();
    const code =
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
    for(var j = 0; ; j++) {
      console.log("Infinite loop");
    }
    price < 20? 40 : 10;
    `;

    const ast = parse(code);
    new NodeIdentifier().identifyAndFreeze(ast);
    ifStatement = ast.body[1] as estree.IfStatement & Identified;
    whileLoop = ast.body[2] as estree.WhileStatement & Identified;
    doWhileLoop = ast.body[3] as estree.DoWhileStatement & Identified;
    forLoop = ast.body[4] as estree.ForStatement & Identified;
    infiniteForLoop = ast.body[5] as estree.ForStatement & Identified;
    ternaryExpression = (ast.body[6] as estree.ExpressionStatement).expression as estree.ConditionalExpression & Identified;
  });

  function actMutator(node: IdentifiedNode) {
    const mutants = sut.applyMutations(node, copy);
    if (Array.isArray(mutants)) {
      return mutants;
    } else {
      return [];
    }
  }

  describe('should not generate an infinite loop', () => {

    it('when given a do-while loop', () => {
      const mutatedNodes = actMutator(doWhileLoop);

      const testValue = (mutatedNodes[0] as estree.Literal).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(doWhileLoop.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(identified(doWhileLoop.test).nodeID);
    });

    it('when given a while loop', () => {
      const mutatedNodes = actMutator(whileLoop);

      const testValue = (mutatedNodes[0] as estree.Literal).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(whileLoop.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(identified(whileLoop.test).nodeID);
    });

    it('when given a for loop', () => {
      const mutatedNodes = actMutator(forLoop);

      const testValue = (mutatedNodes[0] as estree.Literal).value;
      expect(testValue).to.be.false;
      expect(mutatedNodes[0].nodeID).to.not.eq(forLoop.nodeID);
      if (forLoop.test) {
        expect(mutatedNodes[0].nodeID).to.eq(identified(forLoop.test).nodeID);
      } else {
        expect.fail('test.nodeID was expected to be not undefined');
      }
    });

    it('when given an infinite-for loop', () => {
      const forStatementNode = actMutator(infiniteForLoop)[0];
      if (forStatementNode.type === Syntax.ForStatement && forStatementNode.test && forStatementNode.test.type === Syntax.Literal) {
        const testValue = forStatementNode.test.value;
        expect(testValue).to.be.false;
        expect(forStatementNode.nodeID).to.eq(infiniteForLoop.nodeID);
      } else {
        expect.fail(`Node ${forStatementNode} unexpected.`);
      }
    });
  });

  describe('should generate a single mutant', () => {
    it('when given a do-while loop', () => {
      const mutatedNodes = actMutator(doWhileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a while loop', () => {
      const mutatedNodes = actMutator(whileLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });

    it('when given a for loop', () => {
      const mutatedNodes = actMutator(forLoop);

      expect(mutatedNodes).to.have.lengthOf(1);
    });
  });

  describe('should generate multiple mutants', () => {
    it('when given an if-statement', () => {
      const mutatedNodes = actMutator(ifStatement) as [estree.SimpleLiteral & Identified];

      expect(mutatedNodes).to.have.length(2);
      expect(mutatedNodes[0].nodeID).not.to.eq(ifStatement.nodeID);
      expect(mutatedNodes[1].nodeID).not.to.eq(ifStatement.nodeID);
      expect(mutatedNodes[0].nodeID).to.eq(identified(ifStatement.test).nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(identified(ifStatement.test).nodeID);
      expect(mutatedNodes[0].value).to.be.false;
      expect(mutatedNodes[1].value).to.be.true;
    });

    it('when given a ternary-statement', () => {
      const mutatedNodes = actMutator(ternaryExpression) as [estree.SimpleLiteral & Identified];

      expect(mutatedNodes).to.have.length(2);
      expect(mutatedNodes[0].nodeID).not.to.eq(ternaryExpression.nodeID);
      expect(mutatedNodes[1].nodeID).not.to.eq(ternaryExpression.nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(identified(ternaryExpression.test).nodeID);
      expect(mutatedNodes[1].nodeID).to.eq(identified(ternaryExpression.test).nodeID);
      expect(mutatedNodes[0].value).to.be.false;
      expect(mutatedNodes[1].value).to.be.true;
    });
  });

  describe('should not crash', () => {
    it('when given an for-loop', () => {
      const mutatedNodes = actMutator(infiniteForLoop);

      expect(mutatedNodes).to.have.length(1);
      expect(mutatedNodes[0].nodeID).eq(infiniteForLoop.nodeID);
    });
  });
});
