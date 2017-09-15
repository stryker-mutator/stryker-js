import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class UnaryNotMutator extends NodeMutator<ts.PrefixUnaryExpression> {

  name: string = 'UnaryNot';

  public guard(node: ts.Node): node is ts.PrefixUnaryExpression {
    return node.kind === ts.SyntaxKind.PrefixUnaryExpression;
  }

  public identifyReplacements(node: ts.PrefixUnaryExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (node.operator === ts.SyntaxKind.ExclamationToken) {
      return [ { node, replacement: node.operand.getFullText(sourceFile) }];
    } else {
      return [];
    }
  }
}