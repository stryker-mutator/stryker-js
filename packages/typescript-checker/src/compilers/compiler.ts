import ts from 'typescript';

export type SourceFiles = Record<
  string,
  {
    fileName: string;
    imports: Set<string>;
    dependents: Set<string>;
  }
>;

export interface TypescriptCompiler {
  init(): Promise<{ dependencyFiles: SourceFiles; errors: ts.Diagnostic[] }>;
  check(): Promise<readonly ts.Diagnostic[]>;
}
