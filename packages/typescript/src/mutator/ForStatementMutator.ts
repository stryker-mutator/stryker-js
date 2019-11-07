import * as ts from 'typescript';
import { printNode } from '../helpers/tsHelpers';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ForStatementMutator extends NodeMutator<ts.ForStatement> {
  public name = 'ForStatement';

  public guard(node: ts.Node): node is ts.ForStatement {
    return node.kind === ts.SyntaxKind.ForStatement;
  }

  protected identifyReplacements(node: ts.ForStatement, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (node.condition) {
      return [{ node: node.condition, replacement: 'false' }];
    } else {
      // No node to replace. Happens when for statement is defined as `for(let i=0;;i++)`
      // Replace the entire node
      const replacement = printNode(ts.createFor(node.initializer, ts.createFalse(), node.incrementor, node.statement), sourceFile);
      return [{ node, replacement }];
    }
  }
}
