import { types, NodePath } from '@babel/core';

import { NodeMutator } from './node-mutator';

export class BlockStatementMutator implements NodeMutator {
  public name = 'BlockStatement';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isBlockStatement() && this.isValid(path)) {
      yield types.blockStatement([]);
    }
  }

  private isValid(path: NodePath<types.BlockStatement>) {
    return !this.isEmpty(path) && !this.isInvalidConstructorBody(path);
  }

  private isEmpty(path: NodePath<types.BlockStatement>) {
    return !path.node.body.length;
  }

  /**
   * Checks to see if a statement is an invalid constructor body
   * @example
   * // Invalid!
   * class Foo extends Bar {
   *   constructor(public baz: string) {
   *     super(42);
   *   }
   * }
   * @example
   * // Invalid!
   * class Foo extends Bar {
   *   public baz = 'string';
   *   constructor() {
   *     super(42);
   *   }
   * }
   * @see https://github.com/stryker-mutator/stryker-js/issues/2314
   * @see https://github.com/stryker-mutator/stryker-js/issues/2474
   */
  private isInvalidConstructorBody(blockStatement: NodePath<types.BlockStatement>): boolean {
    return !!(
      blockStatement.parentPath.isClassMethod() &&
      blockStatement.parentPath.node.kind === 'constructor' &&
      (this.containsTSParameterProperties(blockStatement.parentPath) || this.containsInitializedClassProperties(blockStatement.parentPath)) &&
      this.hasSuperExpressionOnFirstLine(blockStatement)
    );
  }

  private containsTSParameterProperties(constructor: NodePath<types.ClassMethod>): boolean {
    return constructor.node.params.some((param) => types.isTSParameterProperty(param));
  }

  private containsInitializedClassProperties(constructor: NodePath<types.ClassMethod>): boolean {
    return (
      constructor.parentPath.isClassBody() &&
      constructor.parentPath.node.body.some((classMember) => types.isClassProperty(classMember) && classMember.value)
    );
  }

  private hasSuperExpressionOnFirstLine(constructor: NodePath<types.BlockStatement>): boolean {
    return (
      types.isExpressionStatement(constructor.node.body[0]) &&
      types.isCallExpression(constructor.node.body[0].expression) &&
      types.isSuper(constructor.node.body[0].expression.callee)
    );
  }
}
