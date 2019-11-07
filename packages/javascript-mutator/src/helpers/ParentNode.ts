import * as types from '@babel/types';

export default interface NodeParent {
  parent?: types.Node;
}

export type NodeWithParent = types.Node & NodeParent;
