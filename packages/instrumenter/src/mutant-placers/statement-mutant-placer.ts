import { types } from '@babel/core';

import { mutantTestExpression, createMutatedAst, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

/**
 * Mutant placer that places mutants in statements that allow it.
 * It uses an `if` statement to do so
 */
const statementMutantPlacer: MutantPlacer = (path, mutants) => {
  if (path.isStatement()) {
    // First transform the mutated ast before we start to apply mutants.
    const appliedMutants = mutants.map((mutant) => ({
      mutant,
      ast: createMutatedAst(path, mutant),
    }));

    const instrumentedAst = appliedMutants.reduce(
      // Add if statements per mutant
      (prev: types.Statement, { ast, mutant }) => types.ifStatement(mutantTestExpression(mutant.id), types.blockStatement([ast]), prev),
      path.isBlockStatement()
        ? types.blockStatement([types.expressionStatement(mutationCoverageSequenceExpression(mutants)), ...path.node.body])
        : types.blockStatement([types.expressionStatement(mutationCoverageSequenceExpression(mutants)), path.node])
    );
    if (path.isBlockStatement()) {
      path.replaceWith(types.blockStatement([instrumentedAst]));
    } else {
      path.replaceWith(instrumentedAst);
    }

    return true;
  } else {
    return false;
  }
};

// Export it after initializing so `fn.name` is properly set
export { statementMutantPlacer };
