import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

const booleanLiteralReplacements = Object.freeze({
  // prettier-ignore
  'true': {replacement: 'false', mutatorName: 'TrueToFalse'},
  // prettier-ignore
  'false': {replacement: 'true', mutatorName: 'FalseToTrue'},
  '!': { replacement: '', mutatorName: 'RemoveNegation' },
} as const);

export const booleanLiteralMutator: NodeMutator = {
  name: 'BooleanLiteral',

  *mutate(path, options: string[] | undefined) {
    if (isInMutationLevel(path, options)) {
      if (path.isBooleanLiteral()) {
        yield types.booleanLiteral(!path.node.value);
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        yield deepCloneNode(path.node.argument);
      }
    }
  },
};

function isInMutationLevel(path: any, mutators: string[] | undefined): boolean {
  if (mutators === undefined) {
    return true;
  }
  if (path.isBooleanLiteral()) {
    const { mutatorName } = booleanLiteralReplacements[path.node.value as keyof typeof booleanLiteralReplacements];
    return mutators.some((lit) => lit === mutatorName);
  }
  return (
    path.isUnaryExpression() &&
    path.node.operator === '!' &&
    path.node.prefix &&
    mutators.some((lit: string) => lit === booleanLiteralReplacements['!'].mutatorName)
  );
}
