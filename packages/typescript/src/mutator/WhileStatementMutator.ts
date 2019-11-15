import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class WhileStatementMutator extends NodeMutator<ts.WhileStatement> {
  public name = 'WhileStatement';

  public guard(node: ts.Node): node is ts.WhileStatement {
    return node.kind === ts.SyntaxKind.WhileStatement;
  }

  protected identifyReplacements(node: ts.WhileStatement): NodeReplacement[] {
    return [{ node: node.expression, replacement: 'false' }];
  }
}
