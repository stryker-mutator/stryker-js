'use strict';

import * as _ from 'lodash';
import BaseMutation from './BaseMutation';
import Mutant, {MutatedLocation} from '../Mutant';
import ParserUtils from '../utils/ParserUtils';
import OperatorMutationMap from './OperatorMutationMap';

abstract class BaseOperatorMutation extends BaseMutation {
  
  /**
   * Represents a base class for all operator based mutations.
   * @class
   * @param name - The name of the mutation.
   * @param types - The types of mutation as expected by the parser.
   * @param operators - The object containing a map for targeted operators and their mutated values.
   */
  constructor(name: string, types: string[], private operators: OperatorMutationMap) {
    super(name, types);
  }

  applyMutation(filename: string, originalCode: string, node: ESTree.BinaryExpression, ast: ESTree.Program) {
    var originalOperator = node.operator;
    var mutants: Mutant[] = [];
    node.operator = this.getOperator(node.operator);

    var parserUtils = new ParserUtils();
    var substitude = parserUtils.generate(node);
    // Use native indexOf because the operator may be multiple characters.
    var mutatedColumn = (substitude.indexOf(node.operator) + 1) + node.loc.start.column;
    
    var location: MutatedLocation = {
      mutatedCol: mutatedColumn,
      startCol: node.loc.start.column,
      endCol: node.loc.end.column,
      startLine: node.loc.start.line,
      endLine: node.loc.end.line
    };
    mutants.push(new Mutant(this, filename, originalCode, substitude, location));

    node.operator = originalOperator;

    return mutants;
  }

  canMutate(node: ESTree.BinaryExpression) {
    return !!(node && _.indexOf(this.types, node.type) >= 0 && this.getOperator(node.operator));
  }

  /**
   * Gets the mutated operator based on an unmutated operator.
   * @function
   * @param {String} operator - An umutated operator.
   * @returns {String} The mutated operator.
   */
  getOperator(operator: string): string {
    return this.operators[operator];
  }
}

export default BaseOperatorMutation;
