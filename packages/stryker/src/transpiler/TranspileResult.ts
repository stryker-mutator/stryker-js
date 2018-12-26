import { File } from 'stryker-api/core';

export default interface TranspileResult {
  error: string | null;
  outputFiles: ReadonlyArray<File>;
}
