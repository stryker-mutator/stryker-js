import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens: ts.MapLike<string> = {
  [ts.SyntaxKind.PlusToken]: '-',
  [ts.SyntaxKind.MinusToken]: '+',
  [ts.SyntaxKind.SlashToken]: '*',
  [ts.SyntaxKind.AsteriskToken]: '/',
  [ts.SyntaxKind.PercentToken]: '*'
};

export default class ArithmeticOperatorMutator extends NodeMutator<ts.BinaryExpression> {
  public name: string = 'ArithmeticOperator';

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
