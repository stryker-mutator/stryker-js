import { IdentifiedNode } from './IdentifiedNode';

export default interface Mutator {
  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode | IdentifiedNode[];
  name: string;
}