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

    const dependencyFiles: SourceFiles = {};

    host.afterProgramEmitAndDiagnostics = (program: ts.EmitAndSemanticDiagnosticsBuilderProgram) => {
      program
        .getSourceFiles()
        .filter(filterDependency)
        .forEach((file) => {
          dependencyFiles[file.fileName] = {
            fileName: toPosixFileName(file.fileName),
            imports: new Set(
              program
                .getAllDependencies(file)
                .filter((importFile) => !importFile.includes('/node_modules/') && file.fileName !== importFile)
                .map((importFile) => this.resolveFilename(importFile))
            ),
            dependents: new Set(),
          };
        });
    };

    const compiler = ts.createSolutionBuilderWithWatch(host, [this.tsconfigFile], {});

    compiler.build();

    const errors = await this.check();

    // Function should not be called after the first check is done
    host.afterProgramEmitAndDiagnostics = undefined;

    for (const file in dependencyFiles) {
      const imports = dependencyFiles[file].imports;

      for (const importFile of imports) {
        dependencyFiles[importFile]?.dependents.add(file);
      }
    }

    function filterDependency(file: ts.SourceFile) {
      if (file.fileName.includes('.d.ts')) return false;
      if (file.fileName.includes('node_modules')) return false;
      return true;
    }

    return { dependencyFiles, errors };
  }

  public async check(): Promise<ts.Diagnostic[]> {
    await this.currentTask.promise;
    const errors = [...this.currentErrors];
    this.currentTask = new Task();
    this.currentErrors = [];
    return errors;
  }

  private resolveFilename(fileName: string) {
    if (!fileName.includes('.d.ts')) return fileName;

    const file = this.fs.getFile(fileName);

    const sourceMappingURL = this.getSourceMappingURL(file.content);

    if (!sourceMappingURL) return fileName;

    const sourceMap = this.fs.getFile(path.resolve(fileName, '..', sourceMappingURL));

    const content = JSON.parse(sourceMap.content);

    const source: string = content.sources[0];

    const realPath = path.resolve(sourceMappingURL, '..', source);
    return toPosixFileName(realPath);
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
