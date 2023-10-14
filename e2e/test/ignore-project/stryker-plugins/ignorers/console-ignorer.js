// @ts-check
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export class ConsoleIgnorer {
  /**
   * @param {import('@stryker-mutator/api/ignore').NodePath} path
   */
  shouldIgnore(path) {
    if (
      path.isExpressionStatement() &&
      path.node.expression.type === 'CallExpression' &&
      path.node.expression.callee.type === 'MemberExpression' &&
      path.node.expression.callee.object.type === 'Identifier' &&
      path.node.expression.callee.object.name === 'console' &&
      path.node.expression.callee.property.type === 'Identifier' &&
      path.node.expression.callee.property.name === 'log'
    ) {
      return "We're not interested in console.log statements for now";
    }
    return undefined;
  }
}
export const strykerPlugins = [declareClassPlugin(PluginKind.Ignorer, 'ConsoleIgnorer', ConsoleIgnorer)];
