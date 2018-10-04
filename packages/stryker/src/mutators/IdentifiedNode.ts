import { Node } from 'estree';

export interface Identified {
  nodeID: number;
}

export type IdentifiedNode = Node & Identified;
