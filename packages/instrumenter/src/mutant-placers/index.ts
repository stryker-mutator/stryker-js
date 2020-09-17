export * from './mutant-placer';
import { NodePath } from '@babel/core';

import { Mutant } from '../mutant';

import { MutantPlacer } from './mutant-placer';
import { statementMutantPlacer } from './statement-mutant-placer';
import { expressionMutantPlacer } from './expression-mutant-placer';

export const MUTANT_PLACERS = Object.freeze([expressionMutantPlacer, statementMutantPlacer]);

/**
 * Represents a mutant placer, tries to place a mutant in the AST with corresponding mutation switch and mutant covering expression
 * @see https://github.com/stryker-mutator/stryker/issues/1514
 * @param node The ast node to try and replace with a mutated
 * @param mutants The mutants to place in the AST node
 */
export function placeMutant(node: NodePath, mutants: Mutant[], mutantPlacers: readonly MutantPlacer[] = MUTANT_PLACERS) {
  if (mutants.length) {
    for (const placer of mutantPlacers) {
      try {
        if (placer(node, mutants)) {
          return true;
        }
      } catch (error) {
        throw new Error(
          `Error while placing mutants of type(s) "${mutants.map((mutant) => mutant.mutatorName).join(', ')}" on ${node.node.loc?.start.line}:${
            node.node.loc?.start.column
          } with ${placer.name}. ${error.stack}`
        );
      }
    }
  }
  return false;
}
