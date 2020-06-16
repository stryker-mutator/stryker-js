import { types, traverse, NodePath, parseSync } from '@babel/core';
import { expect } from 'chai';
import generate from '@babel/generator';

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

export function parseJS(code: string) {
  return parseSync(code)! as types.File;
}

export function parseTS(code: string, fileName = 'example.ts') {
  return parseSync(code, {
    presets: [require.resolve('@babel/preset-typescript')],
    filename: fileName,
    plugins: [[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }]],
  })! as types.File;
}

export function findNodePath<T = types.Node>(ast: types.File, searchQuery: (nodePath: NodePath<types.Node>) => boolean): NodePath<T> {
  let theNode: undefined | NodePath<T>;
  traverse(ast, {
    noScope: true,
    enter(path) {
      if (searchQuery(path)) {
        theNode = (path as unknown) as NodePath<T>;
        path.stop();
      }
    },
  });
  if (theNode) {
    return theNode;
  } else {
    throw new Error(`Cannot find node ${searchQuery.toString()} in ${generate(ast)}`);
  }
}
