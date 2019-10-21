import { File } from '@stryker-mutator/api/core';

export default interface TranspileResult {
  outputFiles: readonly File[];
  error: string | null;
}
