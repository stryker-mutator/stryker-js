import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class DoStatementMutator extends NodeMutator<ts.DoStatement> {
  public name = 'DoStatement';

  public guard(node: ts.Node): node is ts.DoStatement {
    return node.kind === ts.SyntaxKind.DoStatement;
  }

  protected identifyReplacements(node: ts.DoStatement): NodeReplacement[] {
    return [{ node: node.expression, replacement: 'false' }];
  }
}
