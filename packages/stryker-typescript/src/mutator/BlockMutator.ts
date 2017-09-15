import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';


export default class BlockMutator extends NodeMutator<ts.Block> {
  name = 'Block';

  guard(node: ts.Node): node is ts.Block {
    return node.kind === ts.SyntaxKind.Block;
  }

  protected identifyReplacements(block: ts.Block, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (block.statements.length) {
      return [{ node: block, replacement: '{}' }];
    } else {
      return [];
    }
  }

}