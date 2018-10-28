import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ConditionalExpressionMutator extends NodeMutator<ts.ConditionalExpression> {
  public name = 'ConditionalExpression';

  public guard(node: ts.Node): node is ts.ConditionalExpression {
    return node.kind === ts.SyntaxKind.ConditionalExpression;
  }

  protected identifyReplacements(node: ts.ConditionalExpression): NodeReplacement[] {
    return [
      { node: node.condition, replacement: 'false' },
      { node: node.condition, replacement: 'true' }
    ];
  }

}
