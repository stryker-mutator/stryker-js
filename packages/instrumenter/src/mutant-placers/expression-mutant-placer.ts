import { NodePath, types } from '@babel/core';

import { mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

/**
 * Will set the identifier of anonymous function expressions if is located in a variable declaration.
 * Will treat input as readonly. Returns undefined if not needed.
 * @example
 * const a = function() { }
 * becomes
 * const a = function a() {}
 */
function classOrFunctionExpressionNamedIfNeeded(path: NodePath<types.Expression>): types.Expression | undefined {
  if ((path.isFunctionExpression() || path.isClassExpression()) && !path.node.id) {
    if (path.parentPath.isVariableDeclarator() && types.isIdentifier(path.parentPath.node.id)) {
      path.node.id = path.parentPath.node.id;
    } else if (
      path.parentPath.isObjectProperty() &&
      types.isIdentifier(path.parentPath.node.key) &&
      path.getStatementParent()?.isVariableDeclaration()
    ) {
      path.node.id = path.parentPath.node.key;
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
function arrowFunctionExpressionNamedIfNeeded(path: NodePath<types.Expression>): types.Expression | undefined {
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

function nameIfAnonymous(path: NodePath<types.Expression>): types.Expression {
  return classOrFunctionExpressionNamedIfNeeded(path) ?? arrowFunctionExpressionNamedIfNeeded(path) ?? path.node;
}

function isValidParent(child: NodePath<types.Expression>) {
  const parent = child.parentPath;
  return !isObjectPropertyKey() && !parent.isTaggedTemplateExpression();
  function isObjectPropertyKey() {
    return parent.isObjectProperty() && parent.node.key === child.node;
  }
}

/**
 * Places the mutants with a conditional expression: `global.activeMutant === 1? mutatedCode : originalCode`;
 */
export const expressionMutantPlacer: MutantPlacer<types.Expression> = {
  name: 'expressionMutantPlacer',
  canPlace(path) {
    return path.isExpression() && isValidParent(path);
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
