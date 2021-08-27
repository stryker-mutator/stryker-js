import { NodePath } from '@babel/core';
import * as types from '@babel/types';
import weaponRegex from 'weapon-regex';

import { NodeMutator } from '.';

/**
 * Checks that a string literal is an obvious regex string literal
 * @param path The string literal to checks
 * @example
 * new RegExp("\\d{4}");
 */
function isObviousRegexString(path: NodePath<types.StringLiteral>) {
  return (
    path.parentPath.isNewExpression() &&
    types.isIdentifier(path.parentPath.node.callee) &&
    path.parentPath.node.callee.name === RegExp.name &&
    path.parentPath.node.arguments[0] === path.node
  );
}
const weaponRegexOptions: weaponRegex.Options = { mutationLevels: [1] };

export const regexMutator: NodeMutator = {
  name: 'Regex',

  *mutate(path) {
    if (path.isRegExpLiteral()) {
      for (const replacementPattern of mutatePattern(path.node.pattern)) {
        const replacement = types.regExpLiteral(replacementPattern, path.node.flags);
        yield replacement;
      }
    } else if (path.isStringLiteral() && isObviousRegexString(path)) {
      for (const replacementPattern of mutatePattern(path.node.value)) {
        yield types.stringLiteral(replacementPattern);
      }
    }
  },
};

function mutatePattern(pattern: string): string[] {
  if (pattern.length) {
    try {
      return weaponRegex.mutate(pattern, weaponRegexOptions).map((mutant) => mutant.pattern);
    } catch (err: any) {
      console.error(
        `[RegexMutator]: The Regex parser of weapon-regex couldn't parse this regex pattern: "${pattern}". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: ${err.message}`
      );
    }
  }
  return [];
}
