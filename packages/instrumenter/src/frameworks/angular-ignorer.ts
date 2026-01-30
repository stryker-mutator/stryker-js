import { Ignorer, NodePath } from '@stryker-mutator/api/ignore';

const ANGULAR_SIGNAL_IO_FUNCTIONS = Object.freeze(['input', 'model', 'output']);

const ANGULAR_SIGNAL_QUERY_FUNCTIONS = Object.freeze([
  'contentChild',
  'contentChildren',
  'viewChild',
  'viewChildren',
]);

const INPUT_MODEL_OUTPUT_CONFIG_MSG =
  'Angular signal based input, model and output functions configuration object cannot be mutated as that causes issues with the Angular compiler.';

const SIGNAL_QUERY_OPTIONS_MSG =
  'Angular signal query options object cannot be mutated as that causes issues with the Angular compiler.';

export class AngularIgnorer implements Ignorer {
  public shouldIgnore(path: NodePath): string | undefined {
    if (this.isInputModelOrOutputConfigurationObject(path)) {
      return INPUT_MODEL_OUTPUT_CONFIG_MSG;
    }

    if (this.isSignalQueryOptionsObject(path)) {
      return SIGNAL_QUERY_OPTIONS_MSG;
    }

    return undefined;
  }

  #isClassFieldLike(path: NodePath): boolean {
    return (
      path.isClassProperty() ||
      path.isClassPrivateProperty() ||
      path.isClassAccessorProperty()
    );
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

  /**
   * Determines if the given path is a configuration object for an Angular signal query function.
   * This solves the "Argument needs to be statically analyzable." error
   */
  private isSignalQueryOptionsObject(path: NodePath): boolean {
    if (
      !path.isObjectExpression() ||
      !path.parentPath.isCallExpression() ||
      !this.#isClassFieldLike(path.parentPath.parentPath)
    ) {
      return false;
    }

    const callExpression = path.parentPath;
    const objectExpression = path;

    const callee = callExpression.node.callee;

    const isQueryFn =
      callee.type === 'Identifier' &&
      ANGULAR_SIGNAL_QUERY_FUNCTIONS.includes(callee.name);

    const isRequiredQueryFn =
      callee.type === 'MemberExpression' &&
      callee.object.type === 'Identifier' &&
      ANGULAR_SIGNAL_QUERY_FUNCTIONS.includes(callee.object.name) &&
      callee.property.type === 'Identifier' &&
      callee.property.name === 'required';

    if (!isQueryFn && !isRequiredQueryFn) {
      return false;
    }

    return (
      callExpression.node.arguments.length >= 2 &&
      callExpression.node.arguments[1] === objectExpression.node
    );
  }
}
