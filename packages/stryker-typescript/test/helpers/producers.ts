import { TextFile, FileKind } from 'stryker-api/core';

function factory<T>(defaults: T) {
  return (overrides: Partial<T>) => Object.assign({}, defaults, overrides);
}

export const textFile = factory<TextFile>({
  name: '',
  content: '',
  mutated: true,
  included: true,
  kind: FileKind.Text
});