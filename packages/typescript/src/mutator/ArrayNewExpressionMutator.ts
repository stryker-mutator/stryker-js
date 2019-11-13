import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrayNewExpressionMutator extends NodeMutator<ts.NewExpression> {
  public name = 'ArrayNewExpression';
  public guard(node: ts.Node): node is ts.NewExpression {
    return node.kind === ts.SyntaxKind.NewExpression;
  }

  protected identifyReplacements(node: ts.NewExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
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
