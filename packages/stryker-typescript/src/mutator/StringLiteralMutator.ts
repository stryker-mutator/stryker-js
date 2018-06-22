import * as ts from 'typescript';
import NodeMutator, { NodeReplacement } from './NodeMutator';

export type AllStringLiterals =
  // Regular quoted string.
  | ts.StringLiteral
  // Templates string with values embedded.
  | ts.TemplateExpression
  // A raw token is emitted if the template string has no embeds.
  | ts.Token<ts.SyntaxKind.FirstTemplateToken>;

export default class StringLiteralMutator extends NodeMutator<AllStringLiterals> {
  public name = 'StringLiteral';

  public guard(node: ts.Node): node is AllStringLiterals {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.TemplateExpression:
      case ts.SyntaxKind.FirstTemplateToken:
        return true;
      default:
        return false;
    }
  }

  private isInvalidParent(parent: ts.Node): boolean {
    switch (parent.kind) {
      case ts.SyntaxKind.ImportDeclaration:
      case ts.SyntaxKind.LastTypeNode:
      case ts.SyntaxKind.JsxAttribute:
      case ts.SyntaxKind.ExpressionStatement:
      case ts.SyntaxKind.LiteralType:
        return true;
      default:
        return false;
    }
  }

  protected identifyReplacements(str: AllStringLiterals): NodeReplacement[] {
    if (str.parent && this.isInvalidParent(str.parent)) {
      return [];
    }

    if (this.isEmptyString(str)) {
      return [{ node: str, replacement: '"Stryker was here!"' }];
    } else {
      return [{ node: str, replacement: '""' }];
    }
  }

  private isEmptyString(str: AllStringLiterals) {
    // Check for empty strings first.
    if (str.kind === ts.SyntaxKind.StringLiteral && str.text === '') {
      return true;
    }

    // Only check for the Token form of template literals. It's impossible to have a TemplateExpression
    // that is empty as it's only used when there is a value embedded. I haven't found a case where the
    // cast fails but the worst that can happen is it is undefined and we fall through to the wrong statement.
    if ((str.kind === ts.SyntaxKind.FirstTemplateToken && (str as ts.Node & { text: string }).text === '')) {
      return true;
    }

    return false;
  }
}
