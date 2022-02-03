import path from 'path';

import ts from 'typescript';
import { propertyPath, Task } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { HybridFileSystem } from '../fs/hybrid-filesystem';
import { determineBuildModeEnabled, guardTSVersion, overrideOptions, retrieveReferencedProjects, toPosixFileName } from '../fs/tsconfig-helpers';
import * as pluginTokens from '../plugin-tokens';

import { SourceFiles, TypescriptCompiler } from './compiler';

export class CompilerWithWatch implements TypescriptCompiler {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);

  private readonly allTSConfigFiles: Set<string>;
  private readonly tsconfigFile: string;
  private currentTask = new Task();
  private currentErrors: ts.Diagnostic[] = [];

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly fs: HybridFileSystem) {
    this.tsconfigFile = toPosixFileName(this.options.tsconfigFile);
    this.allTSConfigFiles = new Set([path.resolve(this.tsconfigFile)]);
  }

  public async init(): Promise<{ sourceFiles: SourceFiles; errors: ts.Diagnostic[] }> {
    guardTSVersion();
    this.guardTSConfigFileExists();
    const buildModeEnabled = determineBuildModeEnabled(this.tsconfigFile);
    const sourceFiles: SourceFiles = new Map();

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
        fileExists: (path: string) => {
          // We want to ignore the buildinfo files. With them the compiler skips the program part we want to use.
          if (path.endsWith('.tsbuildinfo')) {
            return false;
          }
          return ts.sys.fileExists(path);
        },
        getModifiedTime: (pathName: string) => {
          return this.fs.getFile(pathName)?.modifiedTime;
        },
        watchFile: (filePath: string, callback: ts.FileWatcherCallback) => {
          const file = this.fs.getFile(filePath);

          if (file) file.watcher = callback;

          return {
            close: () => {
              delete this.fs.getFile(filePath)!.watcher;
            },
          };
        },
        writeFile: (fileName, data) => {
          this.fs.writeFile(fileName, data);
        },
        watchDirectory: (): ts.FileWatcher => {
          // this is used to see if new files are added to a directory. Can safely be ignored for mutation testing.
          return {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close() {},
          };
        },
      },
      (...args) => {
        const program = ts.createEmitAndSemanticDiagnosticsBuilderProgram(...args);
        program
          .getSourceFiles()
          .filter(filterDependency)
          .forEach((file) => {
            sourceFiles.set(file.fileName, {
              fileName: toPosixFileName(file.fileName),
              imports: new Set(
                program
                  .getAllDependencies(file)
                  .filter((importFile) => !importFile.includes('/node_modules/') && file.fileName !== importFile)
                  .flatMap((importFile) => this.resolveFilename(importFile))
              ),
              importedBy: new Set(),
            });
          });

        function filterDependency(file: ts.SourceFile) {
          if (file.fileName.includes('.d.ts')) return false;
          if (file.fileName.includes('node_modules')) return false;
          return true;
        }

        return program;
      },
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

    const compiler = ts.createSolutionBuilderWithWatch(host, [this.tsconfigFile], {});

    compiler.build();

    const errors = await this.check();

    for (const [fileName, souceFile] of sourceFiles) {
      for (const importFile of souceFile.imports) {
        sourceFiles.get(importFile)?.importedBy.add(fileName);
      }
    }

    return { sourceFiles, errors };
  }

  public async check(): Promise<ts.Diagnostic[]> {
    await this.currentTask.promise;
    const errors = [...this.currentErrors];
    this.currentTask = new Task();
    this.currentErrors = [];
    return errors;
  }

  private resolveFilename(fileName: string): string[] {
    if (!fileName.includes('.d.ts')) return [fileName];

    const file = this.fs.getFile(fileName);
    if (!file) throw new Error(`Could not find ${fileName}`);
    const sourceMappingURL = this.getSourceMappingURL(file.content);

    if (!sourceMappingURL) return [fileName];

    const sourceMapFileName = path.resolve(fileName, '..', sourceMappingURL);
    const sourceMap = this.fs.getFile(sourceMapFileName);
    if (!sourceMap) throw new Error(`Could not find ${sourceMapFileName}`);

    const content = JSON.parse(sourceMap.content);

    return content.sources.map((sourcePath: string) => toPosixFileName(path.resolve(sourceMappingURL, '..', sourcePath)));
  }

  private getSourceMappingURL(content: string): string | undefined {
    return /\/\/# sourceMappingURL=(.+)$/.exec(content)?.[1];
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
