import { EOL } from 'os';
import { resolve } from 'path';

import ts from 'typescript';
import { Checker, CheckResult, MutantStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';

import { InMemoryFileSystem } from './in-memory-file-system';

class Task<T = void> {
  protected _promise: Promise<T>;
  private resolveFn: (value?: T | PromiseLike<T>) => void;
  private rejectFn: (reason: any) => void;
  private _isCompleted = false;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  public get promise() {
    return this._promise;
  }

  public get isCompleted() {
    return this._isCompleted;
  }

  public resolve = (result: T | PromiseLike<T>): void => {
    this._isCompleted = true;
    this.resolveFn(result);
  };

  public reject = (reason: any): void => {
    this._isCompleted = true;
    this.rejectFn(reason);
  };
}

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};

// Override some compiler options that have to do with code quality. When mutating, we're not interested in the resulting code quality
// See https://github.com/stryker-mutator/stryker/issues/391 for more info
const COMPILER_OPTIONS_OVERRIDES: Readonly<Partial<ts.CompilerOptions>> = Object.freeze({
  allowUnreachableCode: true,
  noUnusedLocals: false,
  noUnusedParameters: false,
});

export class TypescriptChecker implements Checker {
  private readonly fs = new InMemoryFileSystem();
  private currentTask: Task<CheckResult>;
  private readonly currentErrors: ts.Diagnostic[] = [];
  private readonly tsconfigFiles: string[] = [resolve('tsconfig.json')];

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly logger: Logger) {}
  public async initialize(): Promise<void> {
    this.currentTask = new Task();
    const compiler = ts.createSolutionBuilderWithWatch(
      ts.createSolutionBuilderWithWatchHost(
        {
          ...ts.sys,
          readFile: (fileName) => {
            const content = this.fs.getFile(fileName)?.content;
            if (content && this.tsconfigFiles.includes(resolve(fileName))) {
              return this.postProcessTSConfig(fileName, content);
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
          summary.code !== 6032 && this.resolveCurrent();
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

  private postProcessTSConfig(fileName: string, content: string) {
    const parsed = ts.parseConfigFileTextToJson(fileName, content);
    if (parsed.error) {
      return content; // let the ts compiler deal with this error
    } else {
      const config = {
        ...parsed.config,
        compilerOptions: {
          ...parsed.config?.compilerOptions,
          ...COMPILER_OPTIONS_OVERRIDES,
        },
      };
      return JSON.stringify(config);
    }
  }

  private resolveCurrent(): void {
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

  public async check(mutant: Mutant): Promise<CheckResult> {
    if (this.fs.existsInMemory(mutant.fileName)) {
      this.clear();
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
   * Clear state between checks
   */
  private clear() {
    while (this.currentErrors.pop()) {
      // Idle
    }
    this.currentTask = new Task();
  }
  private readonly logDiagnostic = (label: string) => {
    return (d: ts.Diagnostic) => {
      this.logger.debug(`${label} ${ts.formatDiagnosticsWithColorAndContext([d], diagnosticsHost)}`);
    };
  };
}
