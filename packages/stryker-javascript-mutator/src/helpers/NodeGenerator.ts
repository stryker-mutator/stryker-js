import { types } from 'babel-core';

export default class NodeGenerator {
  static createBooleanLiteralNode(originalNode: types.Node, value: boolean): types.BooleanLiteral {
    return {
      start: originalNode.start,
      end: originalNode.end,
      loc: originalNode.loc,
      type: 'BooleanLiteral',
      value: value
    };
  }
}