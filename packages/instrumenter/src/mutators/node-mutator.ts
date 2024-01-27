import type { types, NodePath } from '@babel/core';

import { NodeMutatorConfiguration, MutationLevel } from '../mutation-level/mutation-level.js';

export interface NodeMutator<T extends keyof MutationLevel> {
  /**
   * Generates the mutations that fit a given Node, restricted by the Mutation Level.
   * @param path the NodePath to mutate.
   * @param levelMutations the relevant group of allowed mutations in the Mutation Level. Allows all if undefined.
   */
  // It would be stricter for the type to be `MutatorDefinition` rather than `keyof MutationLevel` but that
  // prevents the definition of custom mutators from {@link babel.transformer.spec.ts}
  mutate(path: NodePath): Iterable<[types.Node, keyof MutationLevel]>;
  readonly name: string;

  /**
   * A record of all possible mutations in a Node.
   */
  operators: NodeMutatorConfiguration<T>;
}
