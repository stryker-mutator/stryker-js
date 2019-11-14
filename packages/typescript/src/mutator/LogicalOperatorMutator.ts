import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens: ts.MapLike<string> = {
  [ts.SyntaxKind.BarBarToken]: '&&',
  [ts.SyntaxKind.AmpersandAmpersandToken]: '||'
};

export default class LogicalOperatorMutator extends NodeMutator<ts.BinaryExpression> {
  public name: string = 'LogicalOperator';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  public identifyReplacements(node: ts.BinaryExpression): NodeReplacement[] {
    const replacement = replaceTokens[node.operatorToken.kind];
    if (replacement) {
      return [{ node: node.operatorToken, replacement }];
    } else {
      return [];
    }
  }
}
