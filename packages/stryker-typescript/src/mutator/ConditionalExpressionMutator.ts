import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ConditionalExpressionMutator extends NodeMutator<ts.ConditionalExpression> {
  name = 'ConditionalExpression';

  guard(node: ts.Node): node is ts.ConditionalExpression {
    return node.kind === ts.SyntaxKind.ConditionalExpression;
  }

  protected identifyReplacements(node: ts.ConditionalExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    return [
      { node: node.condition, replacement: 'false' },
      { node: node.condition, replacement: 'true' }];
  }

}