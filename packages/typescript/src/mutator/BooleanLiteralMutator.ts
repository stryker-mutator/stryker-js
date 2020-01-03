import * as ts from 'typescript';

import { printNode } from '../helpers/tsHelpers';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class BooleanLiteralMutator extends NodeMutator<ts.BooleanLiteral | ts.PrefixUnaryExpression> {
  public name: string = 'BooleanLiteral';

  public guard(node: ts.Node): node is ts.BooleanLiteral | ts.PrefixUnaryExpression {
    return node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.PrefixUnaryExpression;
  }

  protected identifyReplacements(node: ts.BooleanLiteral | ts.PrefixUnaryExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return [{ node, replacement: 'true' }];
    } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return [{ node, replacement: 'false' }];
    } else if (node.kind === ts.SyntaxKind.PrefixUnaryExpression && node.operator === ts.SyntaxKind.ExclamationToken) {
      return [{ node, replacement: printNode(node.operand, sourceFile) }];
    } else {
      return [];
    }
  }
}
