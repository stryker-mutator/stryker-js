import * as types from '@babel/types';
import { NodePath } from '@babel/core';
import * as weaponRegex from 'weapon-regex';

import { NodeMutation } from '../mutant';

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

export class RegexMutator implements NodeMutator {
  public name = 'Regex';

  constructor(private readonly weaponRegexMutateImpl = weaponRegex.mutate) {}

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isRegExpLiteral()) {
      return this.mutatePattern(path.node.pattern).map((replacementPattern) => {
        const replacement = types.cloneNode(path.node, false);
        replacement.pattern = replacementPattern;
        return {
          original: path.node,
          replacement,
        };
      });
    } else if (path.isStringLiteral() && isObviousRegexString(path)) {
      return this.mutatePattern(path.node.value).map((replacementPattern) => {
        const replacement = types.cloneNode(path.node, false);
        replacement.value = replacementPattern;
        return {
          original: path.node,
          replacement,
        };
      });
    }
    return [];
  }

  private mutatePattern(pattern: string): string[] {
    if (pattern.length) {
      try {
        return this.weaponRegexMutateImpl(pattern, weaponRegexOptions).map((mutant) => mutant.pattern);
      } catch (err) {
        console.error(
          `[RegexMutator]: The Regex parser of weapon-regex couldn't parse this regex pattern: "${pattern}". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: ${err.message}`
        );
      }
    }
    return [];
  }
}
