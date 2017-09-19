import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class WhileStatementMutator extends NodeMutator<ts.WhileStatement> {
  name = 'WhileStatement';
  
  guard(node: ts.Node): node is ts.WhileStatement {
    return node.kind === ts.SyntaxKind.WhileStatement;
  }

  protected identifyReplacements(node: ts.WhileStatement, sourceFile: ts.SourceFile): NodeReplacement[] {
    return [{ node: node.expression, replacement: 'false' }];
  }
}