import { EOL } from 'os';
import path from 'path';

import ts from 'typescript';
import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Task, propertyPath } from '@stryker-mutator/util';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';

import { HybridFileSystem } from './fs';
import { determineBuildModeEnabled, overrideOptions, retrieveReferencedProjects, guardTSVersion } from './tsconfig-helpers';
import * as pluginTokens from './plugin-tokens';

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};

const FILE_CHANGE_DETECTED_DIAGNOSTIC_CODE = 6032;

typescriptCheckerLoggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);
// eslint-disable-next-line @typescript-eslint/ban-types
function typescriptCheckerLoggerFactory(loggerFactory: LoggerFactoryMethod, target: Function | undefined) {
  const targetName = target?.name ?? TypescriptChecker.name;
  const category = targetName === TypescriptChecker.name ? TypescriptChecker.name : `${TypescriptChecker.name}.${targetName}`;
  return loggerFactory(category);
}

create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): TypescriptChecker {
  return injector
    .provideFactory(commonTokens.logger, typescriptCheckerLoggerFactory, Scope.Transient)
    .provideClass(pluginTokens.fs, HybridFileSystem)
    .injectClass(TypescriptChecker);
}

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  private currentTask: Task<CheckResult> = new Task();
  private readonly currentErrors: ts.Diagnostic[] = [];
  /**
   * Keep track of all tsconfig files which are read during compilation (for project references)
   */
  private readonly allTSConfigFiles: Set<string>;

  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);
  private readonly tsconfigFile: string;

  constructor(private readonly logger: Logger, options: StrykerOptions, private readonly fs: HybridFileSystem) {
    this.tsconfigFile = options.tsconfigFile;
    this.allTSConfigFiles = new Set([path.resolve(this.tsconfigFile)]);
  }

  /**
   * Starts the typescript compiler and does a dry run
   */
  public async init(): Promise<void> {
    guardTSVersion();
    this.guardTSConfigFileExists();
    this.currentTask = new Task();
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
          watchFile: (path: string, callback: ts.FileWatcherCallback) => {
            this.fs.watchFile(path, callback);
            return {
              close: () => {
                delete this.fs.getFile(path)!.watcher;
              },
            };
          },
          writeFile: (path, data) => {
            this.fs.writeFile(path, data);
          },
          createDirectory: () => {
            // Idle, no need to create directories in the hybrid fs
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
      [this.tsconfigFile],
      {}
    );
    compiler.build();
    const result = await this.currentTask.promise;
    if (result.status === CheckStatus.CompileError) {
      throw new Error(`TypeScript error(s) found in dry run compilation: ${result.reason}`);
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
        status: CheckStatus.Passed,
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
        this.allTSConfigFiles.add(referencedProject);
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
        status: CheckStatus.CompileError,
        reason: errorText,
      });
    }
    this.currentTask.resolve({ status: CheckStatus.Passed });
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
