import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ObjectLiteralMutator extends NodeMutator<ts.ObjectLiteralExpression> {
  public name = 'ObjectLiteral';

  public guard(node: ts.Node): node is ts.ObjectLiteralExpression {
    return node.kind === ts.SyntaxKind.ObjectLiteralExpression;
  }

  protected identifyReplacements(o: ts.ObjectLiteralExpression): NodeReplacement[] {
    if (o.properties.length > 0) {
      return [
        { node: o, replacement: '{}' },
        { node: o, replacement: 'null' }
      ];
    } else {
      return [{ node: o, replacement: 'null' }];
    }
  }
}
