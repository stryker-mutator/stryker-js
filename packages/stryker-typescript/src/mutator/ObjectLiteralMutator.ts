import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ObjectLiteralMutator extends NodeMutator<ts.ObjectLiteralExpression> {
  public name = 'Object';

  public guard(node: ts.Node): node is ts.ObjectLiteralExpression {
    return node.kind === ts.SyntaxKind.ObjectLiteralExpression;
  }

  protected identifyReplacements(o: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (o.properties.length > 0) {
      return [{ node: o, replacement: '{}' }];
    } else {
      return [];
    }
  }

}
