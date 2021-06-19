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
const switchCaseMutantPlacer: MutantPlacer = (path, mutants) => {
  if (path.isSwitchCase()) {
    // First transform the mutated ast before we start to apply mutants.
    // const appliedMutants = mutants.map((mutant) => {
    //   const ast = createMutatedAst(path, mutant);
    //   if (!types.isSwitchCase(ast)) {
    //     throw new Error(`${switchCaseMutantPlacer.name} can only place SwitchCase syntax`);
    //   }
    //   return {
    //     ast,
    //     mutant,
    //   };
    // });

    const instrumentedConsequent = mutants.reduce(
      // Add if statements per mutant
      (prev: types.Statement, mutant) =>
        types.ifStatement(mutantTestExpression(mutant.id), types.blockStatement(mutant.applied(path.node).consequent), prev),
      types.blockStatement([types.expressionStatement(mutationCoverageSequenceExpression(mutants)), ...path.node.consequent])
    );
    return types.switchCase(path.node.test, [instrumentedConsequent]);
  }
  return;
};

// Export it after initializing so `fn.name` is properly set
export { switchCaseMutantPlacer };
