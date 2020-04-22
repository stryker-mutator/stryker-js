import * as ts from 'typescript';

import { printNode } from '../helpers/tsHelpers';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens: ts.MapLike<string> = {
  [ts.SyntaxKind.PlusPlusToken]: '--',
  [ts.SyntaxKind.MinusMinusToken]: '++',
};

export default class UpdateOperatorMutator extends NodeMutator<ts.PrefixUnaryExpression | ts.PostfixUnaryExpression> {
  public name = 'UpdateOperator';

  public guard(node: ts.Node): node is ts.PrefixUnaryExpression {
    return node.kind === ts.SyntaxKind.PrefixUnaryExpression || node.kind === ts.SyntaxKind.PostfixUnaryExpression;
  }

  protected identifyReplacements(node: ts.PrefixUnaryExpression | ts.PostfixUnaryExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    const replacementToken = replaceTokens[node.operator];
    if (typeof replacementToken === 'string') {
      const operand = printNode(node.operand, sourceFile);
      const replacement = node.kind === ts.SyntaxKind.PrefixUnaryExpression ? replacementToken + operand : operand + replacementToken;
      return [{ node, replacement }];
    } else {
      return [];
    }
  }
}
