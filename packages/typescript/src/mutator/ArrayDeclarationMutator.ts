import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrayDeclarationMutator extends NodeMutator<ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression> {
  public name = 'ArrayDeclaration';

  public guard(node: ts.Node): node is ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression {
    return (
      node.kind === ts.SyntaxKind.ArrayLiteralExpression || node.kind === ts.SyntaxKind.CallExpression || node.kind === ts.SyntaxKind.NewExpression
    );
  }

  protected identifyReplacements(
    node: ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression,
    sourceFile: ts.SourceFile
  ): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
      if (node.elements.length) {
        return [{ node, replacement: '[]' }];
      } else {
        return [{ node, replacement: '["Stryker was here"]' }];
      }
    } else if (node.kind === ts.SyntaxKind.CallExpression && node.expression.kind !== ts.SyntaxKind.Identifier) {
      // extra guard in case of a function call expression
      return [];
    } else {
      if (node.expression.getFullText(sourceFile).trim() === 'Array') {
        const newPrefix = node.kind === ts.SyntaxKind.NewExpression ? 'new ' : '';
        const mutatedCallArgs = node.arguments && node.arguments.length ? '' : '[]';
        return [{ node, replacement: `${newPrefix}Array(${mutatedCallArgs})` }];
      } else {
        return [];
      }
    }
  }
}
