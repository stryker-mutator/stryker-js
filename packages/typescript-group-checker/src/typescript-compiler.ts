import path from 'path';

import ts from 'typescript';
import { Task } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { MemoryFileSystem } from './fs/memory-filesystem';
import { determineBuildModeEnabled, overrideOptions, retrieveReferencedProjects, toPosixFileName } from './fs/tsconfig-helpers';
import * as pluginTokens from './plugin-tokens';

export class TypescriptCompiler {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.mfs);

  private readonly allTSConfigFiles: Set<string>;
  private readonly tsconfigFile: string;
  private currentTask = new Task();
  private currentErrors: ts.Diagnostic[] = [];

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly fs: MemoryFileSystem) {
    this.tsconfigFile = toPosixFileName(this.options.tsconfigFile);
    this.allTSConfigFiles = new Set([path.resolve(this.tsconfigFile)]);
    const buildModeEnabled = determineBuildModeEnabled(this.tsconfigFile);

    const compiler = ts.createSolutionBuilderWithWatch(
      ts.createSolutionBuilderWithWatchHost(
        {
          ...ts.sys,
          readFile: (fileName) => {
            const content = this.fs.getFile(fileName)?.content;
            if (content && this.allTSConfigFiles.has(path.resolve(fileName))) {
              return this.adjustTSConfigFile(fileName, content, buildModeEnabled);
            }
            return content;
          },
          readDirectory: this.fs.readDirectory.bind(this.fs),
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
          writeFile: (fileName) => { },
        },
        undefined,
        (error) => {
          this.currentErrors.push(error);
        },
        (status) => { },
        (summary) => {
          this.currentTask.resolve();
        }
      ),
      [this.tsconfigFile],
      {}
    );

    compiler.build();
  }

  public async check(): Promise<readonly ts.Diagnostic[]> {
    await this.currentTask.promise;
    const errors = [...this.currentErrors];
    this.currentTask = new Task();
    this.currentErrors = [];
    return errors;
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
}
