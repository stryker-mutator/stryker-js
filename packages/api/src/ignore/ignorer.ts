// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NodePath {
  // Left empty so the declaration can be merged
}

export interface Ignorer {
  shouldIgnore(path: NodePath): string | undefined;
}
