import * as ts from 'typescript';
import { Mutant } from 'stryker-api/mutant';
import Mutator from './Mutator';

export default class UnaryNotMutator extends Mutator<ts.PrefixUnaryExpression> {

  name: string = 'UnaryNot';

  public guard(node: ts.Node): node is ts.PrefixUnaryExpression {
    return node.kind === ts.SyntaxKind.PrefixUnaryExpression;
  }

  public mutate(node: ts.PrefixUnaryExpression): Mutant[] {
    if (node.operator === ts.SyntaxKind.ExclamationToken) {
      return [this.createMutant(node, node.operand.getFullText(this.currentSourceFile))];
    } else {
      return [];
    }
  }
}