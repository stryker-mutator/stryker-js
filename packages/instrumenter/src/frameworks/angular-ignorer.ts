import { Ignorer, NodePath } from '@stryker-mutator/api/ignore';

const ANGULAR_SIGNAL_IO_FUNCTIONS = Object.freeze(['input', 'model', 'output']);

/**
 * An ignorer that ignores mutations on Angular constructs that wouldn't survive compilation.
 * This ignorer will ignore mutations on the following constructs:
 * - Angular signal based input, model and output functions configuration object.
 */
export class AngularIgnorer implements Ignorer {
  public shouldIgnore(path: NodePath): string | undefined {
    return this.isInputModelOrOutputConfigurationObject(path)
      ? 'Angular signal based input, model and output functions configuration object cannot be mutated as that causes issues with the ivy compiler.'
      : undefined;
  }

  /**
   * Determines if the given path is a configuration object for an Angular input, model or output function.
   * This solves the "Argument needs to be statically analyzable." error
   */
  private isInputModelOrOutputConfigurationObject(path: NodePath): boolean {
    if (
      !path.isObjectExpression() ||
      !path.parentPath.isCallExpression() ||
      !path.parentPath.parentPath.isClassProperty()
    ) {
      return false;
    }

    const callExpression = path.parentPath;
    const objectExpression = path;

    const isRequiredSignalIOFunction =
      callExpression.node.callee.type === 'MemberExpression' &&
      callExpression.node.callee.object.type === 'Identifier' &&
      ANGULAR_SIGNAL_IO_FUNCTIONS.includes(
        callExpression.node.callee.object.name,
      ) &&
      callExpression.node.callee.property.type === 'Identifier' &&
      callExpression.node.callee.property.name === 'required';

    const isSignalIOFunction =
      callExpression.node.callee.type === 'Identifier' &&
      ANGULAR_SIGNAL_IO_FUNCTIONS.includes(callExpression.node.callee.name);
    const isOutput =
      callExpression.node.callee.type === 'Identifier' &&
      callExpression.node.callee.name === 'output';

    if (isRequiredSignalIOFunction || isOutput) {
      // The { alias: '...' } should be the first argument of the call expression
      return (
        callExpression.node.arguments.length >= 1 &&
        callExpression.node.arguments[0] === objectExpression.node
      );
    }
    if (isSignalIOFunction) {
      // The { alias: '...' } should be the second argument of the call expression
      return (
        callExpression.node.arguments.length >= 2 &&
        callExpression.node.arguments[1] === objectExpression.node
      );
    }

    return false;
  }
}
