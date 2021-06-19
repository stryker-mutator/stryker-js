import { types } from '@babel/core';

import { mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

/**
 * Mutant placer that places mutants in statements that allow it.
 * It uses an `if` statement to do so
 */
const statementMutantPlacer: MutantPlacer = (path, mutants) => {
  if (path.isStatement()) {
    const placedAst = mutants.reduce(
      (prev: types.Statement, mutant) => types.ifStatement(mutantTestExpression(mutant.id), types.blockStatement([mutant.applied(path.node)]), prev),
      path.isBlockStatement()
        ? types.blockStatement([types.expressionStatement(mutationCoverageSequenceExpression(mutants)), ...path.node.body])
        : types.blockStatement([types.expressionStatement(mutationCoverageSequenceExpression(mutants)), path.node])
    );
    if (path.isBlockStatement()) {
      return types.blockStatement([placedAst]);
    } else {
      return placedAst;
    }
  }
  return;
};

// Export it after initializing so `fn.name` is properly set
export { statementMutantPlacer };
