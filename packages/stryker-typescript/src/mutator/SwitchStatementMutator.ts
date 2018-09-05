import * as ts from 'typescript';
import { partition } from 'lodash';

import NodeMutator, { NodeReplacement } from './NodeMutator';
import { printNode } from '../helpers/tsHelpers';

/**
 * Returns true if a switch case statement is the default one
 */
function isDefaultClause(clause: ts.CaseOrDefaultClause): clause is ts.DefaultClause {
  return clause.kind === ts.SyntaxKind.DefaultClause;
}

export default class SwitchStatementMutator extends NodeMutator<ts.CaseBlock> {
  public name = 'SwitchStatement';

  public guard(node: ts.Node): node is ts.CaseBlock {
    return node.kind === ts.SyntaxKind.CaseBlock;
  }

  protected identifyReplacements(node: ts.CaseBlock, sourceFile: ts.SourceFile): NodeReplacement[] {
    const replacements = [];
    const [defaultClauses, nonDefaultClauses] = partition(node.clauses, isDefaultClause);
    if (nonDefaultClauses.length > 0) {
      const replacement = printNode(ts.createCaseBlock(defaultClauses), sourceFile);
      replacements.push({ node, replacement });
    }
    return replacements;
  }

}
