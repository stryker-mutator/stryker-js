import type { types, NodePath } from '@babel/core';

import { NodeMutatorConfiguration, MutationLevel } from '../mutation-level/mutation-level.js';

export interface NodeMutator<T extends keyof MutationLevel> {
  /**
   * Generates the mutations that fit a given Node, restricted by the Mutation Level.
   * @param path the NodePath to mutate.
   * @param levelMutations the relevant group of allowed mutations in the Mutation Level. Allows all if undefined.
   */
  mutate(path: NodePath, levelMutations: string[] | undefined): Iterable<types.Node>;

  /**
   * Number of mutants that can be generated, .
   */
  numberOfMutants(path: NodePath): number;

  /**
   * Name of the Mutator.
   */
  readonly name: string;

  /**
   * A record of all possible mutations in a Node.
   */
  operators: NodeMutatorConfiguration<T>;
}
