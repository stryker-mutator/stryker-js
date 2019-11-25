import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrayDeclarationMutator extends NodeMutator<ts.ArrayLiteralExpression | ts.NewExpression> {
  public name = 'ArrayDeclaration';

  public guard(node: ts.Node): node is ts.ArrayLiteralExpression | ts.NewExpression {
    return node.kind === ts.SyntaxKind.ArrayLiteralExpression || node.kind === ts.SyntaxKind.NewExpression;
  }

  protected identifyReplacements(node: ts.ArrayLiteralExpression | ts.NewExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
      if (node.elements.length) {
        return [
          { node, replacement: '[]' },
          { node, replacement: 'null' }
        ];
      } else {
        return [
          { node, replacement: '["Stryker was here"]' },
          { node, replacement: 'null' }
        ];
      }
    } else {
      if (node.expression.getFullText(sourceFile).trim() === 'Array') {
        if (node.arguments && node.arguments.length) {
          return [
            { node, replacement: 'new Array()' },
            { node, replacement: 'null' }
          ];
        } else {
          return [
            { node, replacement: 'new Array([])' },
            { node, replacement: 'null' }
          ];
        }
      } else {
        return [];
      }
    }
  }
}
