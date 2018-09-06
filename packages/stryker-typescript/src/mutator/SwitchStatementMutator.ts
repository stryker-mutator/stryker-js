import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';
import { printNode } from '../helpers/tsHelpers';
import { NodeArray } from 'typescript';

/**
 * Given an array of length n, return an array length n of arrays length n-1
 * where each item has been removed in sequence
 *
 * e.g. [0, 1, 2] -> [[1, 2], [0, 2], [0, 1]]
 */
const sequentialSplices = <T extends ts.Node>(collection: NodeArray<T>): T[][] => {
  return collection.map((_, i) => {
    return collection.filter((_, j) => {
      return i !== j;
    });
  });
};

export default class SwitchStatementMutator extends NodeMutator<ts.CaseBlock> {
  public name = 'SwitchStatement';

  public guard(node: ts.Node): node is ts.CaseBlock {
    return node.kind === ts.SyntaxKind.CaseBlock;
  }

  protected identifyReplacements(node: ts.CaseBlock, sourceFile: ts.SourceFile): NodeReplacement[] {
    // Generate possible case arrays
    const caseSplices = sequentialSplices(node.clauses);
    // Map into new CaseBlocks
    const replacements = caseSplices.map(caseSplice => {
      const replacement = printNode(ts.createCaseBlock(caseSplice), sourceFile);
      return { node, replacement };
    });
    return replacements;
  }
}
