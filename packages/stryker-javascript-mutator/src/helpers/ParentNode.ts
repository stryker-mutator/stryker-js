import { types } from 'babel-core';
export default interface NodeParent {
  parent?: types.Node;
}

export type NodeWithParent = types.Node & NodeParent;
