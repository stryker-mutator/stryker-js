import {Mutator} from '../api/mutant';
import OperatorMutatorMap from './OperatorMutatorMap';

abstract class OperatorMutator implements Mutator {

  /**
   * Represents a base class for all operator based mutations.
   * @param name The name of the mutator.
   * @param types The type of operators which should be mutated.
   * @param operators The object containing a map for targeted operators and their mutated values.
   */
  constructor(public name: string, public types: string[], private operators: OperatorMutatorMap) {
  }

  applyMutations(node: ESTree.Node, deepCopy: (obj: any) => any): ESTree.Node[] {
    let nodes: ESTree.Node[] = [];

    if (this.canMutate(<ESTree.BinaryExpression>node)) {
      let mutatedNode: ESTree.BinaryExpression = deepCopy(node);
      mutatedNode.operator = this.getOperator((<ESTree.BinaryExpression>node).operator);
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private canMutate(node: ESTree.BinaryExpression): boolean {
    return !!(node && this.types.indexOf(node.type) >= 0 && this.getOperator(node.operator));
  }

  /**
   * Gets the mutated operator based on an unmutated operator.
   * @function
   * @param {String} operator - An umutated operator.
   * @returns {String} The mutated operator.
   */

  private getOperator(operator: string): string {
    return this.operators[operator];
  }
}

export default OperatorMutator;
