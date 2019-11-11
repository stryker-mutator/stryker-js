import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrayLiteralMutator extends NodeMutator<ts.ArrayLiteralExpression> {
  public name = 'ArrayLiteral';

  public guard(node: ts.Node): node is ts.ArrayLiteralExpression {
    return node.kind === ts.SyntaxKind.ArrayLiteralExpression;
  }

  protected identifyReplacements(node: ts.ArrayLiteralExpression): NodeReplacement[] {
    if (node.elements.length) {
      return [{ node, replacement: '[]' }];
    } else {
      return [{ node, replacement: "['Stryker was here']" }];
    }
  }
}
