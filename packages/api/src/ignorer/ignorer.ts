export type IgnoreResult = false | { ignore: true; reason: string };

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NodePath {
  // Left empty so the declaration can be merged
}

export interface Ignorer {
  init?(): Promise<void>;

  shouldIgnore(path: NodePath): IgnoreResult;
}
