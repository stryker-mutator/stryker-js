import { File } from 'stryker-api/core';

export default interface TranspileResult {
  outputFiles: ReadonlyArray<File>;
  error: string | null;
}