import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class BlockStatementMutator extends NodeMutator<ts.Block> {
  public name = 'BlockStatement';

  public guard(node: ts.Node): node is ts.Block {
    return node.kind === ts.SyntaxKind.Block;
  }

  protected identifyReplacements(block: ts.Block): NodeReplacement[] {
    if (block.statements.length) {
      return [{ node: block, replacement: '{}' }];
    } else {
      return [];
    }
  }
}
