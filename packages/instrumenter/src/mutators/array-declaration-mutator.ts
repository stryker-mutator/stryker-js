import babel, { type NodePath } from '@babel/core';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression, SpreadElement, ArgumentPlaceholder, JSXNamespacedName } from '@babel/types';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

const arrayDeclarationReplacements = Object.assign({
  EmptyArray: { replacementOperator: types.arrayExpression([types.stringLiteral('Stryker was here')]), mutatorName: 'EmptyArray' },
  EmptyArrayConstructor: { replacementOperator: [types.stringLiteral('Stryker was here')], mutatorName: 'EmptyArrayConstructor' },
  FilledArray: { replacementOperator: types.arrayExpression(), mutatorName: 'FilledArray' },
  FilledArrayConstructor: { replacementOperator: [], mutatorName: 'FilledArrayConstructor' },
} as const);

type arrayDeclarationT = Array<ArgumentPlaceholder | Expression | JSXNamespacedName | SpreadElement>;

export const arrayDeclarationMutator: NodeMutator = {
  name: 'ArrayDeclaration',

  *mutate(path: NodePath, operations: string[] | undefined): Iterable<babel.types.Node> {
    // The check of the [] construct in code
    if (path.isArrayExpression()) {
      if (
        operations == undefined ||
        (operations.includes(arrayDeclarationReplacements.FilledArray.mutatorName as string) && path.node.elements.length) ||
        (operations.includes(arrayDeclarationReplacements.EmptyArray.mutatorName as string) && !path.node.elements.length)
      ) {
        const replacement = path.node.elements.length
          ? arrayDeclarationReplacements.FilledArray.replacementOperator
          : arrayDeclarationReplacements.EmptyArray.replacementOperator;
        yield replacement;
      }
    }
    // Check for the new Array() construct in code
    if (
      (path.isCallExpression() || path.isNewExpression()) &&
      types.isIdentifier(path.node.callee) &&
      path.node.callee.name === 'Array' &&
      (operations == undefined ||
        operations.includes(arrayDeclarationReplacements.EmptyArrayConstructor.mutatorName as string) ||
        operations.includes(arrayDeclarationReplacements.FilledArrayConstructor.mutatorName as string))
    ) {
      const emptyArrayReplacement: arrayDeclarationT = arrayDeclarationReplacements.EmptyArrayConstructor.replacementOperator;
      const FilledArrayReplacement: arrayDeclarationT = arrayDeclarationReplacements.FilledArrayConstructor.replacementOperator;
      const mutatedCallArgs = path.node.arguments.length ? FilledArrayReplacement : emptyArrayReplacement;

      if (
        operations == undefined ||
        (operations.includes(arrayDeclarationReplacements.FilledArrayConstructor.mutatorName as string) && path.node.arguments.length) ||
        (operations.includes(arrayDeclarationReplacements.EmptyArrayConstructor.mutatorName as string) && !path.node.arguments.length)
      ) {
        const replacement = types.isNewExpression(path.node)
          ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
          : types.callExpression(deepCloneNode(path.node.callee), mutatedCallArgs);
        yield replacement;
      }
    }
  },
};
