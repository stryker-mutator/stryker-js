import { NodePath, types } from '@babel/core';

import { Mutant } from '../mutant';
import { createMutatedAst, mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

/**
 * Places the mutants with a conditional expression: `global.activeMutant === 1? mutatedCode : regularCode`;
 */
const conditionalExpressionMutantPlacer: MutantPlacer = (path: NodePath, mutants: Mutant[]): boolean => {
  if (path.isExpression() && !path.parentPath.isObjectProperty() && !path.parentPath.isTaggedTemplateExpression()) {
    // First calculated the mutated ast before we start to apply mutants.
    const appliedMutants = mutants.map((mutant) => ({
      mutant,
      ast: createMutatedAst<types.BinaryExpression>(path as NodePath<types.BinaryExpression>, mutant),
    }));

    // Second add the mutation coverage expression
    path.replaceWith(mutationCoverageSequenceExpression(mutants, path.node));

    // Now apply the mutants
    for (const appliedMutant of appliedMutants) {
      path.replaceWith(types.conditionalExpression(mutantTestExpression(appliedMutant.mutant.id), appliedMutant.ast, path.node));
    }
    return true;
  } else {
    return false;
  }
};

// Export it after initializing so `fn.name` is properly set
export { conditionalExpressionMutantPlacer };
