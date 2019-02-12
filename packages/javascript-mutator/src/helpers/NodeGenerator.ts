import * as types from '@babel/types';

export class NodeGenerator {
  public static createBooleanLiteralNode(originalNode: types.Node, value: boolean): types.BooleanLiteral {
    return {
      end: originalNode.end,
      innerComments: originalNode.innerComments,
      leadingComments: originalNode.leadingComments,
      loc: originalNode.loc,
      start: originalNode.start,
      trailingComments: originalNode.trailingComments,
      type: 'BooleanLiteral',
      value
    };
  }
}
