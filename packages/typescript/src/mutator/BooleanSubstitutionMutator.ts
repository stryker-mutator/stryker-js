import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

export default class BooleanSubstitutionMutator extends NodeMutator<ts.BooleanLiteral> {
  public name: string = 'BooleanSubstitution';

  public guard(node: ts.Node): node is ts.BooleanLiteral {
    return node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.TrueKeyword;
  }

  protected identifyReplacements(node: ts.BooleanLiteral): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return [{ node, replacement: 'true' }];
    } else {
      return [{ node, replacement: 'false' }];
    }
  }
}
