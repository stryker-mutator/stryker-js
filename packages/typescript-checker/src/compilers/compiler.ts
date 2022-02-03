import ts from 'typescript';

export type SourceFiles = Map<string, {
    fileName: string;
    imports: Set<string>;
    importedBy: Set<string>;
  }
>;

export interface TypescriptCompiler {
  init(): Promise<{ sourceFiles: SourceFiles; errors: ts.Diagnostic[] }>;
  check(): Promise<ts.Diagnostic[]>;
}
