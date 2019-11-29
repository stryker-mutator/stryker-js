import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrayDeclarationMutator extends NodeMutator<ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression> {
  public name = 'ArrayDeclaration';

  public guard(node: ts.Node): node is ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression {
    return node.kind === ts.SyntaxKind.ArrayLiteralExpression || node.kind === ts.SyntaxKind.CallExpression || node.kind === ts.SyntaxKind.NewExpression;
  }

  protected identifyReplacements(node: ts.ArrayLiteralExpression | ts.CallExpression | ts.NewExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
      if (node.elements.length) {
        return [{ node, replacement: '[]' }];
      } else {
        return [{ node, replacement: '["Stryker was here"]' }];
      }
    } else if (node.kind === ts.SyntaxKind.CallExpression) {
      if (node.expression.kind === ts.SyntaxKind.Identifier && node.expression.getFullText(sourceFile).trim() === 'Array') {
        if (node.arguments && node.arguments.length) {
          return [{ node, replacement: 'Array()' }];
        } else {
          return [{ node, replacement: 'Array([])' }];
        }
      } else {
        return [];
      }
    } else {
      if (node.expression.getFullText(sourceFile).trim() === 'Array') {
        if (node.arguments && node.arguments.length) {
          return [{ node, replacement: 'new Array()' }];
        } else {
          return [{ node, replacement: 'new Array([])' }];
        }
      } else {
        return [];
      }
    }
  }
}
