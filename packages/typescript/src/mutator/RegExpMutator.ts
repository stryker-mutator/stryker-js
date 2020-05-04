import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class RegExpMutator extends NodeMutator<ts.RegularExpressionLiteral | ts.CallExpression | ts.NewExpression> {
  public name = 'RegExp';

  public guard(node: ts.Node): node is ts.RegularExpressionLiteral | ts.CallExpression | ts.NewExpression {
    return (
      node.kind === ts.SyntaxKind.RegularExpressionLiteral || node.kind === ts.SyntaxKind.CallExpression || node.kind === ts.SyntaxKind.NewExpression
    );
  }

  protected identifyReplacements(
    node: ts.RegularExpressionLiteral | ts.CallExpression | ts.NewExpression,
    sourceFile: ts.SourceFile
  ): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.RegularExpressionLiteral) {
      return [{ node, replacement: "new RegExp('')" }];
    } else if (node.kind === ts.SyntaxKind.CallExpression && node.expression.kind !== ts.SyntaxKind.Identifier) {
      // extra guard in case of a function call expression
      return [];
    } else {
      if (node.expression.getFullText(sourceFile).trim() === 'RegExp') {
        return node.arguments &&
          node.arguments.length &&
          !(node.arguments[0].kind === ts.SyntaxKind.StringLiteral && (node.arguments[0] as ts.StringLiteral).text === '')
          ? [{ node, replacement: "new RegExp('')" }]
          : [{ node, replacement: '/Hello from Stryker/' }];
      } else {
        return [];
      }
    }
  }
}
