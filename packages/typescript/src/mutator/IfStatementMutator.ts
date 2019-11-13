import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class IfStatementMutator extends NodeMutator<ts.IfStatement> {
  public name = 'IfStatement';

  public guard(node: ts.Node): node is ts.IfStatement {
    return node.kind === ts.SyntaxKind.IfStatement;
  }

  protected identifyReplacements(ifStatement: ts.IfStatement): NodeReplacement[] {
    return [
      { node: ifStatement.expression, replacement: 'true' },
      { node: ifStatement.expression, replacement: 'false' }
    ];
  }
}
