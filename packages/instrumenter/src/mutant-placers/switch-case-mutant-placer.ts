import { types } from '@babel/core';

import { memberExpressionChain, createMutatedAst, mutationCoverageSequenceExpression, ID } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

const switchCaseMutantPlacer: MutantPlacer = (path, mutants) => {
  if (path.isStatement()) {
    // First calculate the mutated ast before we start to apply mutants.
    const appliedMutants = mutants.map((mutant) => ({
      mutant,
      ast: createMutatedAst(path, mutant),
    }));

    // Add switch statement
    path.replaceWith(
      types.blockStatement([
        types.switchStatement(memberExpressionChain(ID.GLOBAL, ID.ACTIVE_MUTANT), [
          ...appliedMutants.map(({ ast, mutant }) => types.switchCase(types.numericLiteral(mutant.id), [ast, types.breakStatement()])),
          types.switchCase(null, [
            // Add mutation covering statement
            types.expressionStatement(mutationCoverageSequenceExpression(mutants)),
            path.node,
            types.breakStatement(),
          ]),
        ]),
      ])
    );
    return true;
  } else {
    return false;
  }
};

// Export it after initializing so `fn.name` is properly set
export { switchCaseMutantPlacer };
