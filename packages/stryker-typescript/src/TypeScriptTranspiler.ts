import * as path from 'path';
import * as log4js from 'log4js';
import { readFileSync } from 'mz/fs';
import * as ts from 'typescript';
import { SourceFile } from 'stryker-api/report';
import MemoryCompilerHost from './MemoryCompilerHost';
import Mutant from './Mutant';
import MutatorFactory from './MutatorFactory';
const log = log4js.getLogger('TypeScriptTranspiler');

export default class TypeScriptTranspiler {
  private compilerHost: MemoryCompilerHost;
  private compilerOptions: ts.CompilerOptions;
  private tsSourceFiles: ts.SourceFile[] = [];
  private program: ts.Program;
  private compiledFiles: SourceFile[] = [];
  private mutants: Mutant[];

  constructor(private originalSourceFiles: SourceFile[]) { }

  compile(): SourceFile[] {
    this.setCompilerOptions();
    const sourceFilePaths = this.originalSourceFiles.map(file => file.path);
    this.compilerHost = new MemoryCompilerHost(this.compilerOptions, sourceFilePaths);
    this.includeDefaultLibFile();

    this.createProgram(sourceFilePaths);

    const compilationResult = this.compileProgram(false);
    if (compilationResult) {
      this.compiledFiles = compilationResult;
    }

    return this.compiledFiles;
  }

  mutate(): Mutant[] {
    // const factory = MutatorFactory.instance();
    // const mutators = factory.knownNames().map(name => factory.create(name, undefined));

    this.tsSourceFiles.forEach(tsSourceFile => {
      this.checkNodeForMutants(tsSourceFile, tsSourceFile);
    });
    return this.mutants;
  }

  private checkNodeForMutants(node: ts.Node, sourceFile: ts.SourceFile) {
    if (node.getChildCount(sourceFile) > 0) {
      node.getChildren(sourceFile).forEach((innerNode) => {
        let mutants: Mutant[] = [];
        switch (innerNode.kind) {
          case ts.SyntaxKind.BinaryExpression:
            mutants = MutatorFactory.instance().create('BinaryOperator', undefined).applyMutation(sourceFile.fileName, sourceFile.getFullText(), innerNode, sourceFile);
            break;
          case ts.SyntaxKind.IfStatement
            | ts.SyntaxKind.WhileStatement
            | ts.SyntaxKind.DoStatement
            | ts.SyntaxKind.ForStatement
            | ts.SyntaxKind.ConditionalExpression:
            mutants = MutatorFactory.instance().create('RemoveConditionals', undefined).applyMutation(sourceFile.fileName, sourceFile.getFullText(), innerNode, sourceFile);
            break;
          default:

            break;
        }
        if (mutants) {
          mutants.forEach(mutant => {
            // reset to original program
            this.compilerHost.resetToOriginalFiles();
            // insert mutant in program
            this.compilerHost.addFile(sourceFile.fileName, mutant.getMutatedCode());
            const compilationResult = this.compileProgram(true);
            if (compilationResult) {
              this.mutants.push(mutant);
            } else {
              log.trace(`Skipping mutant of type "${mutant.mutatorName}" because it does not compile. Mutated code: "${mutant.getMutatedCode()}"`)
            }
          });
        }
        if (innerNode.getChildCount(sourceFile) > 0) {
          this.checkNodeForMutants(innerNode, sourceFile);
        }
      });
    }
  }

  private includeDefaultLibFile() {
    // File necessary for compilation
    let libFile = readFileSync(this.compilerHost.getDefaultLibFileLocation());
    this.compilerHost.addFile("lib.d.ts", libFile.toString());
    this.compilerHost.addFileToOriginalFiles("lib.d.ts", libFile.toString());
  }

  private setCompilerOptions() {
    log.trace("Looking for typescript configuration file");
    // let result = ts.readConfigFile("tsconfig.json", () => readFileSync("./tsconfig.json").toString());
    log.warn("Not reading tsconfig as it should be passed by stryker config! Setting default compiler options");
    this.compilerOptions = {
      allowJs: false,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmitOnError: true,
      noImplicitAny: true,
      target: ts.ScriptTarget.ES5,
    };
  }

  private createProgram(sourceFilePaths: string[]) {
    const compilerTarget = this.compilerOptions.target ? this.compilerOptions.target : ts.ScriptTarget.ES5;

    this.originalSourceFiles.forEach(file => {
      const tsSourceFile = ts.createSourceFile(file.path, file.content, compilerTarget, false, ts.ScriptKind.TS);
      this.tsSourceFiles.push(tsSourceFile);
      this.compilerHost.addFile(file.path, file.content);
      this.compilerHost.addFileToOriginalFiles(file.path, file.content);
    });
    this.program = ts.createProgram(sourceFilePaths, this.compilerOptions, this.compilerHost);
  }

  private compileProgram(isMutatedProgram: boolean): SourceFile[] | void {
    const logError: (m: string) => void = isMutatedProgram ? m => log.trace(m) : m => log.error(m);
    const logWarning: (m: string) => void = isMutatedProgram ? m => log.trace(m) : m => log.warn(m);
    const logInfo: (m: string) => void = isMutatedProgram ? m => log.trace(m) : m => log.info(m);

    let compiledSourceFiles: SourceFile[] = [];
    let emitResult = this.program.emit(undefined, (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void => {
      compiledSourceFiles.push({ path: path.normalize(fileName), content: data });
    });

    if (emitResult.emitSkipped) {
      logError('Compilation of TypeScript code failed');
      emitResult.diagnostics.forEach(diagnostic => {
        logWarning(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      });
      return undefined;
    } else {
      logInfo('TypeScript code successfully compiled!');
      return compiledSourceFiles;
    }
  }
}