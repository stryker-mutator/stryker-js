import { IdentifiedNode } from './IdentifiedNode';

export default interface NodeMutator {
  name: string;
  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode | IdentifiedNode[];
}
