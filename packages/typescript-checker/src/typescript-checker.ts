import { EOL } from 'os';

import ts from 'typescript';
import { Checker, CheckResult } from '@stryker-mutator/api/check';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';
import MutantStatus from '@stryker-mutator/api/src/report/MutantStatus';

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

export class TypescriptChecker implements Checker {
  private readonly fs = new InMemoryFileSystem();
  private currentTask: Task<CheckResult>;
  private readonly currentErrors: ts.Diagnostic[] = [];

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly logger: Logger) {}

  public async initialize(): Promise<void> {
    this.currentTask = new Task();
    const compiler = ts.createSolutionBuilderWithWatch(
      ts.createSolutionBuilderWithWatchHost(
        {
          ...ts.sys,
          readFile: (fileName) => {
            return this.fs.getFile(fileName)?.content;
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
    if (result.mutantResult === MutantStatus.TranspileError) {
      throw new Error(`Type error in initial compilation: ${result.reason}`);
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
        mutantResult: MutantStatus.TranspileError,
        reason: errorText,
      });
    }
    this.currentTask.resolve({ mutantResult: MutantStatus.Survived });
  }

  public async check(mutant: Mutant): Promise<CheckResult> {
    this.clear();
    this.fs.mutate(mutant);
    return this.currentTask.promise;
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
