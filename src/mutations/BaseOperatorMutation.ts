'use strict';

var _ = require('lodash');
import BaseMutation from './BaseMutation';
import Mutant from '../Mutant';
import ParserUtils from '../utils/ParserUtils';
import OperatorMutationMap from './OperatorMutationMap';


abstract class BaseOperatorMutation extends BaseMutation {
  _operators: OperatorMutationMap;
  
  /**
   * Represents a base class for all operator based mutations.
   * @class
   * @param name - The name of the mutation.
   * @param types - The types of mutation as expected by the parser.
   * @param operators - The object containing a map for targeted operators and their mutated values.
   */
  constructor(name: string, types: string[], operators: OperatorMutationMap) {
    super(name, types);
    this._operators = operators;
  }

  applyMutation(filename: string, originalCode: string, node: ESTree.BinaryExpression, ast: ESTree.Program) {
    var originalOperator = node.operator;
    var mutants: Mutant[] = [];
    node.operator = this.getOperator(node.operator);

    var parserUtils = new ParserUtils();
    var lineOfCode = parserUtils.generate(node, originalCode);
    // Use native indexOf because the operator may be multiple characters.
    var columnNumber = (lineOfCode.indexOf(node.operator) + 1) + node.loc.start.column;
    mutants.push(new Mutant(filename, originalCode, this, ast, node, columnNumber));

    node.operator = originalOperator;

    return mutants;
  }

  canMutate(node: ESTree.BinaryExpression) {
    return !!(node && _.indexOf(this._types, node.type) >= 0 && this.getOperator(node.operator));
  }

  /**
   * Gets the mutated operator based on an unmutated operator.
   * @function
   * @param {String} operator - An umutated operator.
   * @returns {String} The mutated operator.
   */
  getOperator(operator: string): string {
    return this._operators[operator];
  }
}

export default BaseOperatorMutation;
