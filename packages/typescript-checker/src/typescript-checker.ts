import { EOL } from 'os';
import path from 'path';

import ts from 'typescript';
import { Checker, CheckResult, MutantStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';
import { Task } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';

import { InMemoryFileSystem } from './in-memory-fs';
import { TypescriptCheckerWithStrykerOptions } from './typescript-checker-with-stryker-options';
import { determineBuildModeEnabled, overrideOptions, retrieveReferencedProjects } from './tsconfig-helpers';

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};

const FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE = 6032;

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  private readonly fs = new InMemoryFileSystem();
  private currentTask: Task<CheckResult>;
  private readonly currentErrors: ts.Diagnostic[] = [];
  private readonly tsconfigFiles: Set<string> = new Set([path.resolve('tsconfig.json')]);

  public static inject = tokens(commonTokens.logger, commonTokens.options);
  private readonly rootTSConfigFile: string;

  constructor(private readonly logger: Logger, options: StrykerOptions) {
    this.rootTSConfigFile = (options as TypescriptCheckerWithStrykerOptions).typescriptChecker.tsconfigFile;
  }

  /**
   * Starts the typescript compiler and does a dry run
   */
  public async initialize(): Promise<void> {
    this.currentTask = new Task();
    const buildModeEnabled = determineBuildModeEnabled(this.rootTSConfigFile);
    const compiler = ts.createSolutionBuilderWithWatch(
      ts.createSolutionBuilderWithWatchHost(
        {
          ...ts.sys,
          readFile: (fileName) => {
            const content = this.fs.getFile(fileName)?.content;
            if (content && this.tsconfigFiles.has(path.resolve(fileName))) {
              return this.adjustTSConfigFile(fileName, content, buildModeEnabled);
            }
            return content;
          },
          watchFile: (path: string, callback: ts.FileWatcherCallback) => {
            this.fs.getFile(path)!.watcher = callback;
            return {
              close: () => {
                delete this.fs.getFile(path)!.watcher;
              },
            };
          },
          writeFile: (path, data) => {
            this.fs.writeFile(path, data);
          },
          clearScreen() {
            // idle, never clear the screen
          },
          getModifiedTime: (fileName) => {
            return this.fs.getFile(fileName)!.modifiedTime;
          },
          watchDirectory: (): ts.FileWatcher => {
            // this is used to see if new files are added to a directory. Can safely be ignored for mutation testing.
            return {
              close() {},
            };
          },
        },
        undefined,
        (error) => this.currentErrors.push(error),
        (status) => this.logDiagnostic('status')(status),
        (summary) => {
          this.logDiagnostic('summary')(summary);
          summary.code !== FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE && this.resolveCheckResult();
        }
      ),
      ['tsconfig.json'],
      {}
    );
    compiler.build();
    const result = await this.currentTask.promise;
    if (result.result === MutantStatus.CompileError) {
      throw new Error(`Type error in initial compilation: ${result.reason}`);
    }
  }

  /**
   * Checks whether or not a mutant results in a compile error.
   * Will simply pass through if the file mutated isn't part of the typescript project
   * @param mutant The mutant to check
   */
  public async check(mutant: Mutant): Promise<CheckResult> {
    if (this.fs.existsInMemory(mutant.fileName)) {
      this.clearCheckState();
      this.fs.mutate(mutant);
      return this.currentTask.promise;
    } else {
      // We allow people to mutate files that are not included in this ts project
      return {
        result: MutantStatus.Init,
      };
    }
  }

  /**
   * Post processes the content of a tsconfig file. Adjusts some options for speed and alters quality options.
   * @param fileName The tsconfig file name
   * @param content The tsconfig content
   * @param buildModeEnabled Whether or not `--build` mode is used
   */
  private adjustTSConfigFile(fileName: string, content: string, buildModeEnabled: boolean) {
    const parsedConfig = ts.parseConfigFileTextToJson(fileName, content);
    if (parsedConfig.error) {
      return content; // let the ts compiler deal with this error
    } else {
      for (const referencedProject of retrieveReferencedProjects(parsedConfig)) {
        this.tsconfigFiles.add(referencedProject);
      }
      return overrideOptions(parsedConfig, buildModeEnabled);
    }
  }

  /**
   * Resolves the task that is currently running. Will report back the check result.
   */
  private resolveCheckResult(): void {
    if (this.currentErrors.length) {
      const errorText = ts.formatDiagnostics(this.currentErrors, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: process.cwd,
        getNewLine: () => EOL,
      });
      this.currentTask.resolve({
        result: MutantStatus.CompileError,
        reason: errorText,
      });
    }
    this.currentTask.resolve({ result: MutantStatus.Init });
  }

  /**
   * Clear state between checks
   */
  private clearCheckState() {
    while (this.currentErrors.pop()) {
      // Idle
    }
    this.currentTask = new Task();
  }
  private readonly logDiagnostic = (label: string) => {
    return (d: ts.Diagnostic) => {
      this.logger.trace(`${label} ${ts.formatDiagnostics([d], diagnosticsHost)}`);
    };
  };
}
