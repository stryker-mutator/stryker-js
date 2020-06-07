import * as ts from 'typescript';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens: ts.MapLike<string[]> = {
  [ts.SyntaxKind.LessThanToken]: ['<=', '>='],
  [ts.SyntaxKind.LessThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.GreaterThanToken]: ['<=', '>='],
  [ts.SyntaxKind.GreaterThanEqualsToken]: ['<', '>'],
  [ts.SyntaxKind.EqualsEqualsToken]: ['!='],
  [ts.SyntaxKind.ExclamationEqualsToken]: ['=='],
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: ['!=='],
  [ts.SyntaxKind.ExclamationEqualsEqualsToken]: ['===']
};

export default class EqualityOperatorMutator extends NodeMutator<ts.BinaryExpression> {
  public name: string = 'EqualityOperator';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return node.kind === ts.SyntaxKind.BinaryExpression;
  }

  public identifyReplacements(node: ts.BinaryExpression): NodeReplacement[] {
    if (replaceTokens[node.operatorToken.kind]) {
      return replaceTokens[node.operatorToken.kind].map((replacement) => ({ node: node.operatorToken, replacement }));
    } else {
      return [];
    }
  }
}
