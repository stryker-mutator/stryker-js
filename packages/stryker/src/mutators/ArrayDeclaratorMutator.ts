import { Syntax } from 'esprima';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayDeclaratorMutator implements NodeMutator {
  name = 'ArrayDeclarator';

  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode {
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

