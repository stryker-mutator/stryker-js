import babel, { type NodePath } from '@babel/core';

import { mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers.js';

import { MutantPlacer } from './mutant-placer.js';

const { types } = babel;

/**
 * Will set the identifier of anonymous function expressions if is located in a variable declaration.
 * Will treat input as readonly. Returns undefined if not needed.
 * @example
 * const a = function() { }
 * becomes
 * const a = function a() {}
 */
function classOrFunctionExpressionNamedIfNeeded(path: NodePath<babel.types.Expression>): babel.types.Expression | undefined {
  if ((path.isFunctionExpression() || path.isClassExpression()) && !path.node.id) {
    if (path.parentPath.isVariableDeclarator() && types.isIdentifier(path.parentPath.node.id)) {
      path.node.id = path.parentPath.node.id;
      return path.node;
    } else if (
      path.parentPath.isObjectProperty() &&
      types.isIdentifier(path.parentPath.node.key) &&
      path.getStatementParent()?.isVariableDeclaration()
    ) {
      path.node.id = path.parentPath.node.key;
      return path.node;
    }
  }
  return;
}

/**
 * Will set the identifier of anonymous arrow function expressions if is located in a variable declaration.
 * Will treat input as readonly. Returns undefined if not needed.
 * @example
 * const a = () => { }
 * becomes
 * const a = (() => { const a = () => {}; return a; })()
 */
function arrowFunctionExpressionNamedIfNeeded(path: NodePath<babel.types.Expression>): babel.types.Expression | undefined {
  if (path.isArrowFunctionExpression() && path.parentPath.isVariableDeclarator() && types.isIdentifier(path.parentPath.node.id)) {
    return types.callExpression(
      types.arrowFunctionExpression(
        [],
        types.blockStatement([
          types.variableDeclaration('const', [types.variableDeclarator(path.parentPath.node.id, path.node)]),
          types.returnStatement(path.parentPath.node.id),
        ])
      ),
      []
    );
  }
  return;
}

function nameIfAnonymous(path: NodePath<babel.types.Expression>): babel.types.Expression {
  return classOrFunctionExpressionNamedIfNeeded(path) ?? arrowFunctionExpressionNamedIfNeeded(path) ?? path.node;
}

function isMemberOrCallExpression(path: NodePath) {
  return isCallExpression(path) || isMemberExpression(path);
}

function isMemberExpression(
  path: NodePath
): path is NodePath<babel.types.MemberExpression | babel.types.OptionalMemberExpression | babel.types.TSNonNullExpression> {
  return path.isMemberExpression() || path.isOptionalMemberExpression() || path.isTSNonNullExpression();
}

function isCallExpression(path: NodePath): path is NodePath<babel.types.CallExpression | babel.types.OptionalCallExpression> {
  return path.isCallExpression() || path.isOptionalCallExpression();
}

function isValidExpression(path: NodePath<babel.types.Expression>) {
  const parent = path.parentPath;
  return !isObjectPropertyKey() && !isPartOfChain() && !parent.isTaggedTemplateExpression();

  /**
   * Determines if the expression is property of an object.
   * @example
   * const a = {
   *  'foo': 'bar' // 'foo' here is an object property
   * };
   */
  function isObjectPropertyKey() {
    return parent.isObjectProperty() && parent.node.key === path.node;
  }

  /**
   * Determines if the expression is part of a call/member chain.
   * @example
   * // bar is part of chain, foo is NOT part of the chain:
   * foo.bar.baz();
   * foo.bar?.baz()
   * foo.bar;
   * foo.bar();
   * foo?.bar();
   */
  function isPartOfChain() {
    return isMemberOrCallExpression(path) && (isMemberExpression(parent) || (isCallExpression(parent) && parent.node.callee === path.node));
  }
}

/**
 * Places the mutants with a conditional expression: `global.activeMutant === 1? mutatedCode : originalCode`;
 */
export const expressionMutantPlacer: MutantPlacer<babel.types.Expression> = {
  name: 'expressionMutantPlacer',
  canPlace(path) {
    return path.isExpression() && isValidExpression(path);
  },
  place(path, appliedMutants) {
    // Make sure anonymous functions and classes keep their 'name' property
    let expression = nameIfAnonymous(path);

    // Add the mutation coverage expression
    expression = mutationCoverageSequenceExpression(appliedMutants.keys(), expression);

    // Now apply the mutants
    for (const [mutant, appliedMutant] of appliedMutants) {
      expression = types.conditionalExpression(mutantTestExpression(mutant.id), appliedMutant, expression);
    }
    path.replaceWith(expression);
  },
};
