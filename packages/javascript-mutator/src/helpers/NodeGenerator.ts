import * as types from '@babel/types';

export class NodeGenerator {
  public static createMutatedCloneWithProperties(originalNode: types.Node, props: { [key: string]: any }): types.Node {
    return {
      ...originalNode,
      ...props,
    };
  }
}
