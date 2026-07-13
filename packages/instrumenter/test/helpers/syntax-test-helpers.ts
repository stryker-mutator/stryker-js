import { createRequire } from 'module';

import * as babel from '@babel/core';
import { File, type NodePath, type types } from '@babel/core';
import { expect } from 'chai';
import generator from '@babel/generator';

export type AstExpectation = (nodePath: NodePath) => boolean;

const require = createRequire(import.meta.url);
const { traverse, parseSync } = babel;

/**
 * This helper function loosely asserts an AST. During unit testing, we're not looking for exact AST comparison,
 * that's more something for integration tests.
 * @param actual the actual parsed file
 * @param assertion the assertion which needs to deliver true for at least one node in the AST
 */
export function expectAst(actual: types.File, assertion: AstExpectation): void {
  let found = false;
  traverse(actual, {
    enter(nodePath: NodePath) {
      if (assertion(nodePath)) {
        found = true;
        nodePath.stop();
      }
    },
  });
  expect(found, `Expected to find ${assertion.toString()}`).true;
}

export function parseJS(code: string): types.File {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const { ast } = new File(
    { filename: 'foo.js' } as unknown as ConstructorParameters<typeof File>[0],
    {
      code,
      ast: parseSync(code, undefined)! as babel.types.File,
      inputMap: undefined,
    },
  );
  return ast;
}

export function parseTS(code: string, fileName = 'example.ts'): types.File {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const { ast } = new File(
    { filename: 'foo.js' } as unknown as ConstructorParameters<typeof File>[0],
    {
      code,
      inputMap: undefined,
      ast: parseSync(code, {
        presets: [require.resolve('@babel/preset-typescript')],
        plugins: [
          [
            require.resolve('@babel/plugin-proposal-decorators'),
            { version: 'legacy' },
          ],
        ],
        filename: fileName,
      })!,
    },
  );
  return ast;
}

export function findNodePath<T extends types.Node = types.Node>(
  ast: types.File,
  searchQuery: (nodePath: NodePath) => boolean,
): NodePath<T> {
  let theNode: NodePath<T> | undefined;
  traverse(ast, {
    noScope: true,
    enter(path: NodePath) {
      if (searchQuery(path)) {
        theNode = path as unknown as NodePath<T>;
        path.stop();
      }
    },
  });
  if (theNode) {
    return theNode;
  } else {
    throw new Error(
      `Cannot find node ${searchQuery.toString()} in ${generator(ast).code}`,
    );
  }
}
