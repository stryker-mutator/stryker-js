import path from 'path';

export * from './mutant-placer';
import { NodePath } from '@babel/core';

import { Mutant } from '../mutant';

import { MutantPlacer } from './mutant-placer';
import { statementMutantPlacer } from './statement-mutant-placer';
import { expressionMutantPlacer } from './expression-mutant-placer';
import { switchCaseMutantPlacer } from './switch-case-mutant-placer';

export const MUTANT_PLACERS = Object.freeze([expressionMutantPlacer, statementMutantPlacer, switchCaseMutantPlacer]);

/**
 * Represents a mutant placer, tries to place a mutant in the AST with corresponding mutation switch and mutant covering expression
 * @see https://github.com/stryker-mutator/stryker/issues/1514
 * @param node The ast node to try and replace with a mutated
 * @param mutants The mutants to place in the AST node
 * @param fileName The name of the file where the mutants are placed
 * @param mutantPlacers The mutant placers to use (for unit testing purposes)
 */
export function placeMutants(node: NodePath, mutants: Mutant[], fileName: string, mutantPlacers: readonly MutantPlacer[] = MUTANT_PLACERS) {
  if (mutants.length) {
    for (const placer of mutantPlacers) {
      try {
        if (placer(node, mutants)) {
          return true;
        }
      } catch (error) {
        const location = `${path.relative(process.cwd(), fileName)}:${node.node.loc?.start.line}:${node.node.loc?.start.column}`;
        const message = `${placer.name} could not place mutants with type(s): "${mutants.map((mutant) => mutant.mutatorName).join(', ')}"`;
        throw node.buildCodeFrameError(
          `${location} ${message}. Either remove this file from the list of files to be mutated, or ignore the mutators. Please report this issue at https://github.com/stryker-mutator/stryker/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug_report.md&title=${encodeURIComponent(
            message
          )}.`
        );
      }
    }
  }
  return false;
}
