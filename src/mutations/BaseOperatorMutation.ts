'use strict';

import * as _ from 'lodash';
import BaseMutation from './BaseMutation';
import Mutant, {MutatedLocation} from '../Mutant';
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
    var mutants: Mutant[] = [];

    var substitude = this.getOperator(node.operator);
    //The code 'a * b * c' has the nodes: `a * b * c` and `a * b` so to change `b * c` into `b / c` we have to start at the last index
    var mutatedColumn = originalCode.split("\n")[node.loc.start.line - 1].lastIndexOf(node.operator, node.loc.end.column);

    var location: MutatedLocation = {
      mutatedCol: mutatedColumn,
      startCol:mutatedColumn,
      endCol: mutatedColumn + node.operator.length,
      startLine: node.loc.start.line,
      endLine: node.loc.end.line
    };
    
    mutants.push(new Mutant(this, filename, originalCode, substitude, location));
    
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
