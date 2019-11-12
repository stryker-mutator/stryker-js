import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ConditionalExpressionMutator extends NodeMutator<ts.BinaryExpression> {
  public name = 'ConditionalExpression';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  private isInvalidParent(parent: ts.Node): boolean {
    switch (parent.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.LiteralType:
        return true;
      default:
        return false;
    }
  }

  private isInvalidOperator(operatorToken: ts.BinaryOperatorToken): boolean {
    switch (operatorToken.kind) {
      case ts.SyntaxKind.PlusToken:
      case ts.SyntaxKind.MinusToken:
      case ts.SyntaxKind.SlashToken:
      case ts.SyntaxKind.AsteriskToken:
      case ts.SyntaxKind.PercentToken:
        return true;
      default:
        return false;
    }
  }

  protected identifyReplacements(node: ts.BinaryExpression): NodeReplacement[] {
    if ((node.parent && this.isInvalidParent(node.parent)) || this.isInvalidOperator(node.operatorToken)) {
      return [];
    }

    return [
      { node, replacement: 'false' },
      { node, replacement: 'true' }
    ];
  }
}
