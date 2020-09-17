import { NodePath, types } from '@babel/core';

import { Mutant } from '../mutant';
import { createMutatedAst, mutantTestExpression, mutationCoverageSequenceExpression } from '../util/syntax-helpers';

import { MutantPlacer } from './mutant-placer';

function nameAnonymousClassOrFunctionExpression(path: NodePath<types.Expression>) {
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
}

function nameIfAnonymous(path: NodePath<types.Expression>): NodePath<types.Expression> {
  nameAnonymousClassOrFunctionExpression(path);
  if (path.isArrowFunctionExpression() && path.parentPath.isVariableDeclarator() && types.isIdentifier(path.parentPath.node.id)) {
    path.replaceWith(
      types.callExpression(
        types.arrowFunctionExpression(
          [],
          types.blockStatement([
            types.variableDeclaration('const', [types.variableDeclarator(path.parentPath.node.id, path.node)]),
            types.returnStatement(path.parentPath.node.id),
          ])
        ),
        []
      )
    );
  }

  return path;
}

function isValidParent(child: NodePath<types.Expression>) {
  const parent = child.parentPath;
  return !isObjectPropertyKey() && !parent.isTaggedTemplateExpression();
  function isObjectPropertyKey() {
    return parent.isObjectProperty() && parent.node.key === child.node;
  }
}

/**
 * Places the mutants with a conditional expression: `global.activeMutant === 1? mutatedCode : regularCode`;
 */
const expressionMutantPlacer: MutantPlacer = (path: NodePath, mutants: Mutant[]): boolean => {
  if (path.isExpression() && isValidParent(path)) {
    // First calculated the mutated ast before we start to apply mutants.
    const appliedMutants = mutants.map((mutant) => ({
      mutant,
      ast: createMutatedAst<types.BinaryExpression>(path as NodePath<types.BinaryExpression>, mutant),
    }));

    // Make sure anonymous functions and classes keep their 'name' property
    path.replaceWith(nameIfAnonymous(path));

    // Add the mutation coverage expression
    path.replaceWith(mutationCoverageSequenceExpression(mutants, path.node));

    // Now apply the mutants
    for (const appliedMutant of appliedMutants) {
      path.replaceWith(types.conditionalExpression(mutantTestExpression(appliedMutant.mutant.id), appliedMutant.ast, path.node));
    }
    return true;
  } else {
    return false;
  }
};

// Export it after initializing so `fn.name` is properly set
export { expressionMutantPlacer };
