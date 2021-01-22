import * as types from '@babel/types';
import { NodePath } from '@babel/core';
import { mutate } from 'weapon-regex';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class RegexMutator implements NodeMutator {
  public name = 'Regex';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isRegExpLiteral()) {
      return mutate(path.node.pattern, { mutationLevels: [1] }).map((mutant) => {
        const replacement = types.cloneNode(path.node, false);
        replacement.pattern = mutant.pattern;
        return {
          original: path.node,
          replacement,
        };
      });
    } else {
      return [];
    }
  }
}
