import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens: ts.MapLike<string[]> = {
  [ts.SyntaxKind.PlusToken]: ['-'],
  [ts.SyntaxKind.MinusToken]: ['+'],
  [ts.SyntaxKind.SlashToken]: ['*'],
  [ts.SyntaxKind.AsteriskToken]: ['/'],
  [ts.SyntaxKind.PercentToken]: ['*'],
  [ts.SyntaxKind.LessThanToken]: ['<=', '>='],
  [ts.SyntaxKind.LessThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.GreaterThanToken]: ['<=', '>='],
  [ts.SyntaxKind.GreaterThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.EqualsEqualsToken]: ['!='],
  [ts.SyntaxKind.ExclamationEqualsToken]: ['=='],
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: ['!=='],
  [ts.SyntaxKind.ExclamationEqualsEqualsToken]: ['==='],
  [ts.SyntaxKind.BarBarToken]: ['&&'],
  [ts.SyntaxKind.AmpersandAmpersandToken]: ['||']
};

export default class BinaryExpressionMutator extends NodeMutator<ts.BinaryExpression> {
  public name: string = 'BinaryExpression';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  public identifyReplacements(node: ts.BinaryExpression): NodeReplacement[] {
    if (replaceTokens[node.operatorToken.kind]) {
      return replaceTokens[node.operatorToken.kind].map(replacement => ({ node: node.operatorToken, replacement }));
    } else {
      return [];
    }
  }
}
