import { File } from '@stryker-mutator/api/core';

export default interface TranspileResult {
  outputFiles: ReadonlyArray<File>;
  error: string | null;
}
