import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';
import { printNode } from '../helpers/tsHelpers';

/**
 * Type guard for seperating default clause from case clauses.
 */
function isDefaultClause(node: ts.CaseOrDefaultClause): node is ts.DefaultClause {
  return node.kind === ts.SyntaxKind.DefaultClause;
}

export default class SwitchCaseMutator extends NodeMutator<ts.CaseOrDefaultClause> {
  public name = 'SwitchCase';

  public guard(node: ts.Node): node is ts.CaseOrDefaultClause {
    return node.kind === ts.SyntaxKind.CaseClause || node.kind === ts.SyntaxKind.DefaultClause;
  }

  protected identifyReplacements(node: ts.CaseOrDefaultClause, sourceFile: ts.SourceFile): NodeReplacement[] {
    const clause = isDefaultClause(node)
      ? ts.createDefaultClause([])
      : ts.createCaseClause(node.expression, []);
    const replacement = printNode(clause, sourceFile);
    return [{ node, replacement }];
  }
}
