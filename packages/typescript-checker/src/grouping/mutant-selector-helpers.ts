import { toPosixFileName } from '../tsconfig-helpers.js';

import { Node } from './node.js';

export function findNode(fileName: string, nodes: Node[]): Node | null {
  for (const node of nodes) {
    if (node.fileName === toPosixFileName(fileName)) return node;
  }

  return null;
}
