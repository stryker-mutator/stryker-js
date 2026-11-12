import * as babel from '@babel/core';
import { type types } from '@babel/core';

import {
  mutantTestExpression,
  mutationCoverageSequenceExpression,
} from '../util/syntax-helpers.js';

import { MutantPlacer } from './mutant-placer.js';

const { types: t } = babel;

/**
 * Mutant placer that places mutants in statements that allow it.
 * It uses an `if` statement to do so
 */
export const statementMutantPlacer: MutantPlacer<types.Statement> = {
  name: 'statementMutantPlacer',
  canPlace(path) {
    // The body of a labeled statement must stay its body, or `continue label`
    // no longer points to a loop. Its mutants are placed on the labeled
    // statement instead.
    return path.isStatement() && !path.parentPath?.isLabeledStatement();
  },
  place(path, appliedMutants) {
    let statement: types.Statement = t.blockStatement([
      t.expressionStatement(
        mutationCoverageSequenceExpression(appliedMutants.keys()),
      ),
      ...(path.isBlockStatement() ? path.node.body : [path.node]),
    ]);
    for (const [mutant, appliedMutant] of appliedMutants) {
      statement = t.ifStatement(
        mutantTestExpression(mutant.id),
        t.blockStatement([appliedMutant]),
        statement,
      );
    }
    path.replaceWith(
      path.isBlockStatement() ? t.blockStatement([statement]) : statement,
    );
  },
};
