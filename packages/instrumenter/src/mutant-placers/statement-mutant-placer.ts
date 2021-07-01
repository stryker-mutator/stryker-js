import { types } from '@babel/core';

import { mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

/**
 * Mutant placer that places mutants in statements that allow it.
 * It uses an `if` statement to do so
 */
export const statementMutantPlacer: MutantPlacer<types.Statement> = {
  name: 'statementMutantPlacer',
  canPlace(path) {
    return path.isStatement();
  },
  place(path, appliedMutants) {
    let statement: types.Statement = types.blockStatement([
      types.expressionStatement(mutationCoverageSequenceExpression(appliedMutants.keys())),
      ...(path.isBlockStatement() ? path.node.body : [path.node]),
    ]);
    for (const [mutant, appliedMutant] of appliedMutants) {
      statement = types.ifStatement(mutantTestExpression(mutant.id), types.blockStatement([appliedMutant]), statement);
    }
    path.replaceWith(path.isBlockStatement() ? types.blockStatement([statement]) : statement);
  },
};
