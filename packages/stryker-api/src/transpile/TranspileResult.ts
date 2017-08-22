import { File } from '../../core';

export default interface TranspileResult {
  outputFiles: File[];
  error: string | null;
}