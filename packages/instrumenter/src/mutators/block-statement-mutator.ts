import babel, { type NodePath } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const blockStatementMutator: NodeMutator = {
  name: 'BlockStatement',

  *mutate(path) {
    if (path.isBlockStatement() && isValid(path)) {
      yield types.blockStatement([]);
    }
  },
};

function isValid(path: NodePath<babel.types.BlockStatement>) {
  return !isEmpty(path) && !isInvalidConstructorBody(path);
}

function isEmpty(path: NodePath<babel.types.BlockStatement>) {
  return !path.node.body.length;
}

/**
 * Checks to see if a statement is an invalid constructor body
 * @example
 * // Invalid!
 * class Foo extends Bar {
 *   constructor(public baz: string) {
 *     super(42);
 *   }
 * }
 * @example
 * // Invalid!
 * class Foo extends Bar {
 *   public baz = 'string';
 *   constructor() {
 *     super(42);
 *   }
 * }
 * @see https://github.com/stryker-mutator/stryker-js/issues/2314
 * @see https://github.com/stryker-mutator/stryker-js/issues/2474
 */
function isInvalidConstructorBody(
  blockStatement: NodePath<babel.types.BlockStatement>,
): boolean {
  return Boolean(
    blockStatement.parentPath.isClassMethod() &&
      blockStatement.parentPath.node.kind === 'constructor' &&
      (containsTSParameterProperties(blockStatement.parentPath) ||
        containsInitializedClassProperties(blockStatement.parentPath)) &&
      hasSuperExpression(blockStatement),
  );
}

function containsTSParameterProperties(
  constructor: NodePath<babel.types.ClassMethod>,
): boolean {
  return constructor.node.params.some((param) =>
    types.isTSParameterProperty(param),
  );
}

function containsInitializedClassProperties(
  constructor: NodePath<babel.types.ClassMethod>,
): boolean {
  return (
    constructor.parentPath.isClassBody() &&
    constructor.parentPath.node.body.some(
      (classMember) => types.isClassProperty(classMember) && classMember.value,
    )
  );
}

function hasSuperExpression(
  constructor: NodePath<babel.types.BlockStatement>,
): boolean {
  let hasSuper = false;
  constructor.traverse({
    Super(path) {
      if (path.parentPath.isCallExpression()) {
        path.stop();
        hasSuper = true;
      }
    },
  });
  return hasSuper;
}
