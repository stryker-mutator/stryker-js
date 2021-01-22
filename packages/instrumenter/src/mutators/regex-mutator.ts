import * as types from '@babel/types';
import { NodePath } from '@babel/core';
import { mutate } from 'weapon-regex';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

// function isObviousRegexString(path: NodePath<types.StringLiteral>){
//   if(path.parentPath.isCallExpression() && path.parentPath.isNewExpression())
// }

export class RegexMutator implements NodeMutator {
  public name = 'Regex';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isRegExpLiteral()) {
      try {
        return mutate(path.node.pattern, { mutationLevels: [1] }).map((mutant) => {
          const replacement = types.cloneNode(path.node, false);
          replacement.pattern = mutant.pattern;
          return {
            original: path.node,
            replacement,
          };
        });
      } catch (err) {
        console.error(
          `[RegexMutator]: The Regex parser of weapon-regex couldn't parse this regex pattern: "${path.node.pattern}". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: ${err.message}`
        );
      }
    }//else if(path.isStringLiteral() && isObviousRegexString(path)){}
    return [];
  }

}
