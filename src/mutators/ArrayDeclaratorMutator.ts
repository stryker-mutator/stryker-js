import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'estree';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayDeclaratorMutator implements Mutator {
  name = 'ArrayDeclarator';

  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T):  void | estree.Node | estree.Node[] {
    if ((node.type === Syntax.CallExpression || node.type === Syntax.NewExpression) && node.callee.type === Syntax.Identifier && node.callee.name === 'Array' && node.arguments.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.arguments = [];
      return mutatedNode;
    }

    if (node.type === Syntax.ArrayExpression && node.elements.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.elements = [];
      return mutatedNode;
    }
  }
}

