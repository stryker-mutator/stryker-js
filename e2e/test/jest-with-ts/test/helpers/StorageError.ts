export class StorageError extends Error {
  public readonly name = 'StorageError';
  constructor(public readonly code: string) {
    super(code);
  }
}
