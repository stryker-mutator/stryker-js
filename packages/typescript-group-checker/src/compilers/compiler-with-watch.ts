import path from 'path';

import ts from 'typescript';
import { propertyPath, Task } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { MemoryFileSystem } from '../fs/memory-filesystem';
import { determineBuildModeEnabled, guardTSVersion, overrideOptions, retrieveReferencedProjects, toPosixFileName } from '../fs/tsconfig-helpers';
import * as pluginTokens from '../plugin-tokens';

import { SourceFiles, TypescriptCompiler } from './compiler';

export class CompilerWithWatch implements TypescriptCompiler {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);

  private readonly allTSConfigFiles: Set<string>;
  private readonly tsconfigFile: string;
  private currentTask = new Task();
  private currentErrors: ts.Diagnostic[] = [];
  private sourceFiles: SourceFiles = {};

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly fs: MemoryFileSystem) {
    this.tsconfigFile = toPosixFileName(this.options.tsconfigFile);
    this.allTSConfigFiles = new Set([path.resolve(this.tsconfigFile)]);
  }

  public async init(): Promise<{ dependencyFiles: SourceFiles; errors: ts.Diagnostic[] }> {
    guardTSVersion();
    this.guardTSConfigFileExists();
    const buildModeEnabled = determineBuildModeEnabled(this.tsconfigFile);

    const host = ts.createSolutionBuilderWithWatchHost(
      {
        ...ts.sys,
        readFile: (fileName) => {
          const content = this.fs.getFile(fileName)?.content;
          if (content && this.allTSConfigFiles.has(path.resolve(fileName))) {
            return this.adjustTSConfigFile(fileName, content, buildModeEnabled);
          }
          return content;
        },
        getModifiedTime: (pathName: string) => {
          return this.fs.getFile(pathName)?.modifiedTime;
        },
        watchFile: (filePath: string, callback: ts.FileWatcherCallback) => {
          const file = this.fs.getFile(filePath);
          if (file) {
            file.watcher = callback;
          }

          return {
            close: () => {
              delete this.fs.getFile(filePath)!.watcher;
            },
          };
        },
        writeFile: (fileName, data) => {
          this.fs.writeFile(fileName, data);
        },
      },
      undefined,
      (error) => {
        this.currentErrors.push(error);
      },
      (status) => {
        this.log.debug(status.messageText.toString());
      },
      () => {
        this.currentTask.resolve();
      }
    );

    host.afterProgramEmitAndDiagnostics = this.afterProgramEmitAndDiagnostics.bind(this);

    const compiler = ts.createSolutionBuilderWithWatch(host, [this.tsconfigFile], {});

    compiler.build();

    const errors = await this.check();

    // Function should not be called after the first check is done
    host.afterProgramEmitAndDiagnostics = undefined;
    this.setSourceFilesDependencies();

    if (Object.keys(this.sourceFiles).length === 0) {
      throw new Error('SourceFiles not set.');
    }

    return { dependencyFiles: this.sourceFiles, errors };
  }

  public async check(): Promise<ts.Diagnostic[]> {
    await this.currentTask.promise;
    const errors = [...this.currentErrors];
    this.currentTask = new Task();
    this.currentErrors = [];
    return errors;
  }

  private afterProgramEmitAndDiagnostics(program: ts.EmitAndSemanticDiagnosticsBuilderProgram) {
    const currentDirectory = toPosixFileName(program.getCurrentDirectory());
    const outDir = (program.getCompilerOptions().outDir ?? '').replace(currentDirectory, '');

    program
      .getSourceFiles()
      .filter(this.filterDependency.bind(this))
      .forEach((file) => {
        this.sourceFiles[file.fileName] = {
          fileName: toPosixFileName(file.fileName),
          imports: new Set(
            program
              .getAllDependencies(file)
              .filter((importFile) => !importFile.includes('/node_modules/') && file.fileName !== importFile)
              .map((importFile) => this.resolveFilename(importFile, outDir))
          ),
          dependencies: new Set([]),
        };
      });
  }

  private filterDependency(file: ts.SourceFile) {
    if (file.fileName in this.sourceFiles) return false;
    if (file.fileName.includes('.d.ts')) return false;
    if (file.fileName.includes('node_modules')) return false;

    return true;
  }

  private setSourceFilesDependencies() {
    for (const file in this.sourceFiles) {
      const imports = this.sourceFiles[file].imports;

      for (const importFile of imports) {
        this.sourceFiles[importFile]?.dependencies.add(file);
      }
    }
  }

  private resolveFilename(text: string, outDir: string) {
    return text.replace('.d.ts', '.ts').replace(outDir, '');
  }

  private adjustTSConfigFile(fileName: string, content: string, buildModeEnabled: boolean) {
    const parsedConfig = ts.parseConfigFileTextToJson(fileName, content);
    if (parsedConfig.error) {
      return content; // let the ts compiler deal with this error
    } else {
      for (const referencedProject of retrieveReferencedProjects(parsedConfig, path.dirname(fileName))) {
        this.allTSConfigFiles.add(referencedProject);
      }
      return overrideOptions(parsedConfig, buildModeEnabled);
    }
  }

  private guardTSConfigFileExists() {
    if (!ts.sys.fileExists(this.tsconfigFile)) {
      throw new Error(
        `The tsconfig file does not exist at: "${path.resolve(
          this.tsconfigFile
        )}". Please configure the tsconfig file in your stryker.conf file using "${propertyPath<StrykerOptions>('tsconfigFile')}"`
      );
    }
  }
}
