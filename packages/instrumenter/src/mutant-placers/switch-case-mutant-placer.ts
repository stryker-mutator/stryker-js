import { types } from '@babel/core';

import { mutantTestExpression, mutationCoverageSequenceExpression } from '../util';

import { MutantPlacer } from './mutant-placer';

/**
 * Places the mutants with consequent of a SwitchCase node. Uses an if-statement to do so.
 * @example
 *  case 'foo':
 *    if (stryMutAct_9fa48(0)) {} else {
 *      stryCov_9fa48(0);
 *      console.log('bar');
 *      break;
 *   }
 */
export const switchCaseMutantPlacer: MutantPlacer<types.SwitchCase> = {
  name: 'switchCaseMutantPlacer',
  canPlace(path) {
    return path.isSwitchCase();
  },
  place(path, appliedMutants) {
    let consequence: types.Statement = types.blockStatement([
      types.expressionStatement(mutationCoverageSequenceExpression(appliedMutants.keys())),
      ...path.node.consequent,
    ]);
    for (const [mutant, appliedMutant] of appliedMutants) {
      consequence = types.ifStatement(mutantTestExpression(mutant.id), types.blockStatement(appliedMutant.consequent), consequence);
    }
    path.replaceWith(types.switchCase(path.node.test, [consequence]));
  },
};
