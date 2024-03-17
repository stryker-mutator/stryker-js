import type { NodePath as BabelNodePath } from '@babel/core';

import { Ignorer, NodePath } from '@stryker-mutator/api/ignore';

declare module '@stryker-mutator/api/ignore' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface NodePath extends BabelNodePath {}
}

const ANGULAR_SIGNAL_IO_FUNCTIONS = ['input', 'model', 'output'];

export class AngularIgnore implements Ignorer {
  public shouldIgnore(path: NodePath): string | undefined {
    return this.isObjectInsideIOFunction(path)
      ? 'Angular signal based input, model and output functions configuration object cannot be mutated as that causes issues with the ivy compiler.'
      : undefined;
  }

  private isSignalIOFunction(path: NodePath): boolean {
    if (!path.isCallExpression()) {
      return false;
    }

    const isRequiredSignalIOFunction =
      path.node.callee.type === 'MemberExpression' &&
      path.node.callee.object.type === 'Identifier' &&
      ANGULAR_SIGNAL_IO_FUNCTIONS.includes(path.node.callee.object.name) &&
      path.node.callee.property.type === 'Identifier' &&
      path.node.callee.property.name === 'required';

    const isSignalIOFunction = path.node.callee.type === 'Identifier' && ANGULAR_SIGNAL_IO_FUNCTIONS.includes(path.node.callee.name);

    return isRequiredSignalIOFunction || isSignalIOFunction;
  }

  private hasComponentOrDirectiveDecorators(path: NodePath): boolean {
    if (!path.isClassDeclaration()) {
      return false;
    }

    const decorators = path.node.decorators ?? [];

    let foundDecorator = false;
    for (let i = 0; i < decorators.length && !foundDecorator; i++) {
      const decorator = decorators[i];
      foundDecorator =
        decorator.expression.type === 'CallExpression' &&
        decorator.expression.callee.type === 'Identifier' &&
        (decorator.expression.callee.name === 'Component' || decorator.expression.callee.name === 'Directive');
    }

    return foundDecorator;
  }

  private isObjectInsideIOFunction(path: NodePath): boolean {
    if (!path.isObjectExpression()) {
      return false;
    }

    const ancestry = path.getAncestry();

    let isInsideIOFunction = false;
    let isInsideClassProperty = false;
    let isInsideComponentOrDirective = false;
    for (let i = 1; i < ancestry.length && (!isInsideIOFunction || !isInsideClassProperty || !isInsideComponentOrDirective); i++) {
      const parentPath = ancestry[i];
      if (!isInsideIOFunction) {
        isInsideIOFunction = this.isSignalIOFunction(parentPath);
      } else if (!isInsideClassProperty) {
        isInsideClassProperty = parentPath.isClassProperty();
      } else if (!isInsideComponentOrDirective) {
        isInsideComponentOrDirective = this.hasComponentOrDirectiveDecorators(parentPath);
      }
    }

    return isInsideIOFunction && isInsideClassProperty && isInsideComponentOrDirective;
  }
}
