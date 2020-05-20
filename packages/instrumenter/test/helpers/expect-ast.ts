import { types, traverse, NodePath } from '@babel/core';
import { expect } from 'chai';

export type AstExpectation = (nodePath: NodePath) => boolean;

/**
 * This helper function loosely asserts an AST. During unit testing, we're not looking for exact AST comparison,
 * that's more something for integration tests.
 * @param actual the actual parsed file
 * @param assertion the assertion which needs to deliver true for at least one node in the AST
 */
export function expectAst(actual: types.File, assertion: AstExpectation): void {
  let found = false;
  traverse(actual, {
    enter(nodePath) {
      if (assertion(nodePath)) {
        found = true;
        nodePath.stop();
      }
    },
  });
  expect(found, `Expected to find ${assertion.toString()}`).true;
}
