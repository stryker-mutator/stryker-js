import { Syntax } from 'esprima';
import { Expression } from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode, Identified } from './IdentifiedNode';

export default class BooleanSubstitutionMutator implements NodeMutator {
  name = 'BooleanSubstitution';

  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] {
    const nodes: IdentifiedNode[] = [];
    
    // !a -> a
    if (node.type === Syntax.UnaryExpression && node.operator === '!') {
      let mutatedNode = copy(node.argument as Expression & Identified) as IdentifiedNode;
      mutatedNode.nodeID = node.nodeID;
      nodes.push(mutatedNode);
    }

    // true -> false or false -> true
    if (node.type === Syntax.Literal && typeof node.value === 'boolean') {
      let mutatedNode = copy(node);
      mutatedNode.value = !mutatedNode.value;
      nodes.push(mutatedNode);
    }
    return nodes;
  }

}