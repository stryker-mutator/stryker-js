import { types } from 'babel-core';

export default class NodeGenerator {
  public static createBooleanLiteralNode(originalNode: types.Node, value: boolean): types.BooleanLiteral {
    return {
      end: originalNode.end,
      loc: originalNode.loc,
      start: originalNode.start,
      type: 'BooleanLiteral',
      value
    };
  }
}
