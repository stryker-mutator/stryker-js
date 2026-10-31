import * as babel from '@babel/core';
import { NodePath, type types as t } from '@babel/core';
import * as weaponRegex from 'weapon-regex';

import { NodeMutator } from './index.js';

const { types } = babel;

/**
 * Checks that a string literal is an obvious regex string literal
 * @param path The string literal to checks
 * @example
 * new RegExp("\\d{4}");
 */
function isObviousRegexString(path: NodePath<t.StringLiteral>) {
  return (
    path.parentPath.isNewExpression() &&
    types.isIdentifier(path.parentPath.node.callee) &&
    path.parentPath.node.callee.name === RegExp.name &&
    path.parentPath.node.arguments[0] === path.node
  );
}

function getFlags(path: NodePath<t.NewExpression>): string | undefined {
  if (types.isStringLiteral(path.node.arguments[1])) {
    return path.node.arguments[1].value;
  }
  return undefined;
}

const weaponRegexOptions: weaponRegex.MutationOptions = { mutationLevels: [1] };

export const regexMutator: NodeMutator = {
  name: 'Regex',

  *mutate(path) {
    if (path.isRegExpLiteral()) {
      for (const replacementPattern of mutatePattern(
        path.node.pattern,
        path.node.flags,
      )) {
        const replacement = types.regExpLiteral(
          replacementPattern,
          path.node.flags,
        );
        yield replacement;
      }
    } else if (path.isStringLiteral() && isObviousRegexString(path)) {
      const flags = getFlags(path.parentPath as NodePath<t.NewExpression>);
      for (const replacementPattern of mutatePattern(path.node.value, flags)) {
        yield types.stringLiteral(replacementPattern);
      }
    }
  },
};

function mutatePattern(pattern: string, flags: string | undefined): string[] {
  if (pattern.length) {
    try {
      return weaponRegex
        .mutate(pattern, flags, weaponRegexOptions)
        .map((mutant) => mutant.pattern)
        .filter((mutatedPattern) => isValidRegex(mutatedPattern, flags));
    } catch (err: any) {
      console.error(
        `[RegexMutator]: The Regex parser of weapon-regex couldn't parse this regex pattern: "${pattern}". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: ${err.message}`,
      );
    }
  }
  return [];
}

/**
 * Checks whether a (mutated) pattern is still a valid regular expression with the given flags.
 * The `u` and `v` flags are stricter than the "classic" regex syntax, so some mutations
 * result in patterns that only throw a SyntaxError with those flags.
 * @example
 * isValidRegex('\\V', 'u'); // false, mutated from /\v/u
 */
function isValidRegex(pattern: string, flags: string | undefined): boolean {
  try {
    new RegExp(pattern, flags);
    return true;
  } catch {
    return false;
  }
}
