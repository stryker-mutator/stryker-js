import * as ts from 'typescript';

import { printNode } from '../helpers/tsHelpers';

import NodeMutator, { NodeReplacement } from './NodeMutator';

const replaceTokens = {
  [ts.SyntaxKind.PlusPlusToken]: '--',
  [ts.SyntaxKind.MinusMinusToken]: '++',
  [ts.SyntaxKind.PlusToken]: '-',
  [ts.SyntaxKind.MinusToken]: '+',
  [ts.SyntaxKind.TildeToken]: '',
  [ts.SyntaxKind.ExclamationToken]: ''
};

export default class PrefixUnaryExpressionMutator extends NodeMutator<ts.PrefixUnaryExpression> {
  public name = 'PrefixUnaryExpression';

  public guard(node: ts.Node): node is ts.PrefixUnaryExpression {
    return node.kind === ts.SyntaxKind.PrefixUnaryExpression;
  }

  protected identifyReplacements(node: ts.PrefixUnaryExpression, sourceFile: ts.SourceFile): NodeReplacement[] {
    const replacement = replaceTokens[node.operator];
    if (typeof replacement === 'string') {
      return [{ node, replacement: replacement + printNode(node.operand, sourceFile) }];
    } else {
      return [];
    }
  }
}
