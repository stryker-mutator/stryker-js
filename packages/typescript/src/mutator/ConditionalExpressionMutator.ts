import * as ts from 'typescript';

import { printNode } from '../helpers/tsHelpers';

import NodeMutator, { NodeReplacement } from './NodeMutator';

/**
 * Type guard for seperating default clause from case clauses.
 */
function isDefaultClause(node: ts.CaseOrDefaultClause): node is ts.DefaultClause {
  return node.kind === ts.SyntaxKind.DefaultClause;
}

export default class ConditionalExpressionMutator extends NodeMutator<
  ts.BinaryExpression | ts.DoStatement | ts.ForStatement | ts.IfStatement | ts.CaseOrDefaultClause | ts.WhileStatement
> {
  public name = 'ConditionalExpression';

  public guard(node: ts.Node): node is ts.BinaryExpression {
    return (
      node.kind === ts.SyntaxKind.BinaryExpression ||
      node.kind === ts.SyntaxKind.CaseClause ||
      node.kind === ts.SyntaxKind.DefaultClause ||
      node.kind === ts.SyntaxKind.DoStatement ||
      node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.IfStatement ||
      node.kind === ts.SyntaxKind.WhileStatement
    );
  }

  private isInvalidParent(parent: ts.Node): boolean {
    switch (parent.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.LiteralType:
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.DefaultClause:
        return true;
      default:
        return false;
    }
  }

  private isInvalidOperator(operatorToken: ts.BinaryOperatorToken): boolean {
    switch (operatorToken.kind) {
      case ts.SyntaxKind.PlusToken:
      case ts.SyntaxKind.MinusToken:
      case ts.SyntaxKind.SlashToken:
      case ts.SyntaxKind.AsteriskToken:
      case ts.SyntaxKind.PercentToken:
        return true;
      default:
        return false;
    }
  }

  protected identifyReplacements(
    node: ts.BinaryExpression | ts.DoStatement | ts.ForStatement | ts.IfStatement | ts.CaseOrDefaultClause | ts.WhileStatement,
    sourceFile: ts.SourceFile
  ): NodeReplacement[] {
    if (node.kind === ts.SyntaxKind.DoStatement || node.kind === ts.SyntaxKind.WhileStatement) {
      return [{ node: node.expression, replacement: 'false' }];
    } else if (node.kind === ts.SyntaxKind.ForStatement) {
      if (node.condition) {
        return [{ node: node.condition, replacement: 'false' }];
      } else {
        // No node to replace. Happens when for statement is defined as `for(let i=0;;i++)`
        // Replace the entire node
        const replacement = printNode(ts.createFor(node.initializer, ts.createFalse(), node.incrementor, node.statement), sourceFile);
        return [{ node, replacement }];
      }
    } else if (node.kind === ts.SyntaxKind.IfStatement) {
      return [
        { node: node.expression, replacement: 'true' },
        { node: node.expression, replacement: 'false' }
      ];
    } else if (node.kind === ts.SyntaxKind.CaseClause || node.kind === ts.SyntaxKind.DefaultClause) {
      // if not a fallthrough case
      if (node.statements.length > 0) {
        const clause = isDefaultClause(node) ? ts.createDefaultClause([]) : ts.createCaseClause(node.expression, []);
        const replacement = printNode(clause, sourceFile);
        return [{ node, replacement }];
      } else {
        return [];
      }
    } else {
      if (
        (node.parent && this.isInvalidParent(node.parent)) ||
        (node.parent && node.parent.parent && this.isInvalidParent(node.parent.parent)) ||
        this.isInvalidOperator(node.operatorToken)
      ) {
        return [];
      }

      return [
        { node, replacement: 'false' },
        { node, replacement: 'true' }
      ];
    }
  }
}
