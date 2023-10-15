// @ts-check
import { PluginKind, declareValuePlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'ConsoleIgnorer', {
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
    },
  }),
];
