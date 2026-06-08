import babel from '@babel/core';
import type { NodePath } from '@babel/core';

import { SvelteTemplateExpressionContext } from '../frameworks/svelte-template-expression-context.js';
import { Mutable } from '../mutant.js';
import { NodeMutator } from './node-mutator.js';

const { types } = babel;

function isSuperCall(expression: babel.types.CallExpression): boolean {
  return expression.callee.type === 'Super';
}

function voidZero(): babel.types.UnaryExpression {
  return types.unaryExpression('void', types.numericLiteral(0), true);
}

export class EmptyExpressionMutator implements NodeMutator {
  public readonly name = 'CallExpression';

  public constructor(
    private readonly svelteTemplateExpressionContext: SvelteTemplateExpressionContext,
  ) {}

  public *mutate(path: NodePath) {
    if (
      path.isCallExpression() &&
      this.svelteTemplateExpressionContext.isTemplateExpressionRoot(path) &&
      !isSuperCall(path.node)
    ) {
      yield voidZero();
      return;
    }

    if (
      this.svelteTemplateExpressionContext.isTemplateExpressionContext(path)
    ) {
      return;
    }

    if (path.isExpressionStatement()) {
      if (
        path.node.expression.type === 'CallExpression' &&
        !isSuperCall(path.node.expression)
      ) {
        yield types.emptyStatement();
      }
    }

    if (
      path.isThrowStatement() &&
      path.node.argument?.type === 'NewExpression'
    ) {
      yield types.emptyStatement();
    }
  }

  public filter(mutantsInScope: Mutable[]) {
    return mutantsInScope.length === 1;
  }
}
