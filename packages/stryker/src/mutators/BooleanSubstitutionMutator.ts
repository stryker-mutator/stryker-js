import { Mutator, IdentifiedNode } from 'stryker-api/mutant';
import { Syntax } from 'esprima';

export default class BooleanSubstitutionMutator implements Mutator {
  name = 'BooleanSubstitution';
  private readonly type = Syntax.Literal;
  private booleanValues: { [targetedOperator: string]: string } = {
    'true': 'false',
    'false': 'true'
  };

  applyMutations(node: IdentifiedNode, copy: <T>(obj: T, deep?: boolean) => T): IdentifiedNode[] {
    let nodes: IdentifiedNode[] = [];
    
    // !a -> a
    if (node.type === Syntax.UnaryExpression && node.operator === '!') {
      let mutatedNode = copy(node.argument) as IdentifiedNode;
      mutatedNode.nodeID = node.nodeID;
      nodes.push(mutatedNode);
    }

    // true -> false or false -> true
    if (node.type === this.type && this.booleanValues[node.raw]) {
      let mutatedNode = copy(node);
      mutatedNode.raw = this.booleanValues[node.raw];
      mutatedNode.value = !mutatedNode.value;
      nodes.push(mutatedNode);
    }
    return nodes;
  }

}