import ts from 'typescript';

export interface DependencyFile {
  fileName: string;
  imports: string[];
}

export interface TypescriptCompiler {
  init(): Promise<{ dependencyFiles: DependencyFile[]; errors: ts.Diagnostic[] }>;
  check(): Promise<readonly ts.Diagnostic[]>;
}
