import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class BlockStatementMutator implements NodeMutator {
  public name = 'BlockStatement';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBlockStatement() && this.isValid(path)) {
      const replacement = types.cloneNode(path.node, false);
      replacement.body = [];
      return [{ original: path.node, replacement }];
    } else {
      return [];
    }
  }

  private isValid(path: NodePath<types.BlockStatement>) {
    return !this.isEmpty(path) && !this.isConstructorBodyWithTSParameterPropertiesAndSuperCall(path);
  }

  private isEmpty(path: NodePath<types.BlockStatement>) {
    return !path.node.body.length;
  }

  /**
   * Checks to see if a statement is the body of a constructor with TS parameter properties and a super call as it's first expression.
   * @example
   * class Foo extends Bar {
   *   constructor(public baz: string) {
   *     super(42);
   *   }
   * }
   * @see https://github.com/stryker-mutator/stryker/issues/2314
   */
  private isConstructorBodyWithTSParameterPropertiesAndSuperCall(path: NodePath<types.BlockStatement>): boolean {
    return !!(
      path.parentPath.isClassMethod() &&
      path.parentPath.node.kind === 'constructor' &&
      path.parentPath.node.params.some((param) => types.isTSParameterProperty(param)) &&
      types.isExpressionStatement(path.node.body[0]) &&
      types.isCallExpression(path.node.body[0].expression) &&
      types.isSuper(path.node.body[0].expression.callee)
    );
  }
}
