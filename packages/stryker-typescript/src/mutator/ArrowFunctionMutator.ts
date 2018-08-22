import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class ArrowFunctionMutator extends NodeMutator<ts.ArrowFunction> {
  public name = 'ArrowFunction';

  public guard(node: ts.Node): node is ts.ArrowFunction {
    return node.kind === ts.SyntaxKind.ArrowFunction;
  }

  protected identifyReplacements(fn: ts.ArrowFunction, sourceFile: ts.SourceFile): NodeReplacement[] {
    if (fn.body.kind === ts.SyntaxKind.Block) {
      // This case is already handled by the BlockMutator.
      return [];
    }

    return [{ node: fn, replacement: '() => undefined' }];
  }

}
