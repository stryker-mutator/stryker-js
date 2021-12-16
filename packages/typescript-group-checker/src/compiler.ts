import ts from 'typescript';

export type SourceFiles = Record<
  string,
  {
    imports: Set<string>;
    dependencies: Set<string>;
  }
>;

export interface TypescriptCompiler {
  init(): Promise<{ dependencyFiles: SourceFiles; errors: ts.Diagnostic[] }>;
  check(): Promise<readonly ts.Diagnostic[]>;
}
