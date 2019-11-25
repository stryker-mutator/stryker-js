import * as types from '@babel/types';

export class NodeGenerator {
  public static createBooleanLiteralNode(originalNode: types.Node, value: boolean): types.BooleanLiteral {
    return NodeGenerator.createAnyLiteralValueNode(originalNode, 'BooleanLiteral', value) as types.BooleanLiteral;
  }

  public static createIdentifierNode(originalNode: types.Node, name: string): types.Identifier {
    return NodeGenerator.createMutatedNode(originalNode, 'Identifier', { name }) as types.Identifier;
  }

  public static createAnyLiteralValueNode(originalNode: types.Node, type: string, value: any): types.Node {
    return NodeGenerator.createMutatedNode(originalNode, type, { value });
  }

  public static createMutatedNode(originalNode: types.Node, type: string, props: any): types.Node {
    return {
      end: originalNode.end,
      innerComments: originalNode.innerComments,
      leadingComments: originalNode.leadingComments,
      loc: originalNode.loc,
      start: originalNode.start,
      trailingComments: originalNode.trailingComments,
      type,
      ...props
    } as types.Node;
  }
}
