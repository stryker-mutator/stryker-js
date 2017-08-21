import TranspileFile from './TranspileFile';

export default interface TranspileResult {
  outputFiles: TranspileFile[];
  error: string | null;
}