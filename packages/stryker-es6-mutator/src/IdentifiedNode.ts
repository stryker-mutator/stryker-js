import { types } from 'babel-core';

export interface Identified {
  nodeID: number;
}

export type IdentifiedNode = types.Node & Identified;