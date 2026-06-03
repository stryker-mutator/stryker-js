import { ChildProcess, fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import {
  determineHitLimitReached,
  DryRunOptions,
  DryRunResult,
  DryRunStatus,
  MutantRunOptions,
  MutantRunResult,
  TestResult,
  TestRunner,
  TestRunnerCapabilities,
  TestStatus,
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import {
  INSTRUMENTER_CONSTANTS,
  MutantCoverage,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { glob } from 'glob';

import * as pluginTokens from './plugin-tokens.js';
import { NodeTestRunnerOptionsWithStrykerOptions } from './node-test-runner-options-with-stryker-options.js';
import { fileOfTestId } from './test-id.js';
import { isSupportedNodeVersion, MIN_NODE_VERSION } from './node-version.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const CHILD_FILE = path.resolve(moduleDir, 'setup', 'child.js');
/**
 * A node:test file loaded first in every run. Its root `beforeEach` runs
 * synchronously before each test, recording the active test id so that
 * Stryker's instrumented coverage counters can be attributed per test.
 */
const SETUP_FILE = path.resolve(moduleDir, 'setup', 'setup.js');
/** Keep only the tail of the child's output so a crash report stays bounded
 * however chatty the test process is. */
const OUTPUT_TAIL_LIMIT = 8192;

interface ReportedTest {
  id: string;
  name: string;
  file?: string;
  status: 'pass' | 'fail';
  timeSpentMs: number;
  failureMessage?: string;
}

/** A message streamed from the child process. */
type ChildMessage =
  | { type: 'test'; test: ReportedTest; hitCount?: number }
  | { type: 'done'; coverage?: MutantCoverage; hitCount?: number }
  | { type: 'error'; error: string };

/** The outcome the runner derives from a child process run. */
interface RunOutcome {
  tests: ReportedTest[];
  coverage?: MutantCoverage;
  hitCount?: number;
  error?: string;
  timedOut?: boolean;
}

interface RunSpec {
  testFiles: string[];
  collectCoverage: boolean;
  concurrency: boolean;
  activeMutant?: string;
  hitLimit?: number;
}

export function createNodeTestRunnerFactory(
  namespace:
    | typeof INSTRUMENTER_CONSTANTS.NAMESPACE
    | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE,
): {
  (injector: Injector<PluginContext>): NodeTestRunner;
  inject: ['$injector'];
} {
  createNodeTestRunner.inject = tokens(commonTokens.injector);
  function createNodeTestRunner(injector: Injector<PluginContext>) {
    return injector
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(NodeTestRunner);
  }
  return createNodeTestRunner;
}

export const createNodeTestRunner = createNodeTestRunnerFactory();

export class NodeTestRunner implements TestRunner {
  public static inject = tokens(
    commonTokens.options,
    commonTokens.logger,
    pluginTokens.globalNamespace,
  );

  private readonly options: NodeTestRunnerOptionsWithStrykerOptions;
  private testFiles: string[] = [];

  constructor(
    options: StrykerOptions,
    private readonly log: Logger,
    private readonly globalNamespace:
      | typeof INSTRUMENTER_CONSTANTS.NAMESPACE
      | '__stryker2__',
  ) {
    this.options = options as NodeTestRunnerOptionsWithStrykerOptions;
  }

  public capabilities(): TestRunnerCapabilities {
    // A fresh worker thread is spawned per run, so the test environment is
    // effectively reloaded every time — including activating a mutant before the
    // SUT is imported, which is what static mutants need. Reporting `true` lets
    // Stryker rely on us for that instead of restarting the whole runner process.
    return { reloadEnvironment: true };
  }

  public async init(): Promise<void> {
    this.assertNodeVersion();
    const patterns = this.options.nodeTest?.testFiles ?? [
      '**/*.@(test|spec).@(js|mjs|cjs)',
      '**/test/**/*.@(js|mjs|cjs)',
    ];
    const files = await glob(patterns, {
      ignore: '**/node_modules/**',
      posix: true,
    });
    this.testFiles = [...new Set(files)].sort();
    this.log.debug(
      `node-test runner discovered ${this.testFiles.length} test file(s)`,
    );
    if (this.testFiles.length === 0) {
      this.log.warn(
        `No test files found for pattern(s): ${patterns.join(', ')}. ` +
          'Configure "nodeTest.testFiles" to point at your test files.',
      );
    }
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(
      {
        testFiles: options.testFiles?.length
          ? options.testFiles
          : this.testFiles,
        // Collect coverage for both 'all' and 'perTest'; serialize so the
        // per-test attribution in setup.ts can't race between tests.
        collectCoverage: options.coverageAnalysis !== 'off',
        concurrency: false,
      },
      options.timeout,
      false, // never bail on a dry run — we need every test and its coverage
    );
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    // node:test ignores testNamePatterns under isolation:'none', so filter to
    // the test *files* that hold a covering test — always a safe superset of the
    // covering tests, never fewer. The file is encoded in each test id, so this
    // works without sharing state between the dry-run and mutant-run processes.
    const testFiles = this.filesFor(options.testFilter) ?? this.testFiles;
    return toMutantRunResult(
      await this.run(
        {
          testFiles,
          collectCoverage: false,
          concurrency: this.options.nodeTest?.concurrency ?? false,
          activeMutant: options.activeMutant.id,
          hitLimit: options.hitLimit,
        },
        options.timeout,
        !options.disableBail,
      ),
    );
  }

  private filesFor(testFilter?: string[]): string[] | undefined {
    if (!testFilter) return undefined;
    const files = new Set<string>();
    for (const id of testFilter) {
      const file = fileOfTestId(id);
      if (file) files.add(file);
    }
    return files.size ? [...files] : undefined;
  }

  private async run(
    spec: RunSpec,
    timeout: number,
    bail: boolean,
  ): Promise<DryRunResult> {
    const outcome = await this.runInChild(spec, timeout, bail);

    if (outcome.timedOut) {
      return { status: DryRunStatus.Timeout, reason: 'Test run timed out' };
    }
    if (outcome.error) {
      return { status: DryRunStatus.Error, errorMessage: outcome.error };
    }

    const hitLimitReached = determineHitLimitReached(
      outcome.hitCount,
      spec.hitLimit,
    );
    if (hitLimitReached) return hitLimitReached;

    const tests: TestResult[] = outcome.tests.map((t) => {
      const base = {
        id: t.id,
        name: t.name,
        timeSpentMs: t.timeSpentMs,
        fileName: t.file,
      };
      return t.status === 'fail'
        ? {
            ...base,
            status: TestStatus.Failed,
            failureMessage: t.failureMessage ?? 'test failed',
          }
        : { ...base, status: TestStatus.Success };
    });

    return {
      status: DryRunStatus.Complete,
      tests,
      mutantCoverage: outcome.coverage,
    };
  }

  /**
   * Forks a detached child process (its own process group) for one run and
   * streams its test events. On a clean finish the child exits itself; on a
   * timeout or — when bailing — the first failure, the group is killed to stop
   * the remaining tests (run() ignores AbortSignal under isolation:'none') and
   * reap any child processes the tests spawned. The group is not signalled after
   * a clean exit, when the pid could already be freed and reused.
   */
  private runInChild(
    spec: RunSpec,
    timeout: number,
    bail: boolean,
  ): Promise<RunOutcome> {
    return new Promise<RunOutcome>((resolve) => {
      const tests: ReportedTest[] = [];
      let settled = false;
      let output = '';
      let child: ChildProcess | undefined;

      const finish = (outcome: RunOutcome, kill = false) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (kill && child) this.killGroup(child);
        const error =
          outcome.error && output
            ? `${outcome.error}\nLast output from the test process:\n${output}`
            : outcome.error;
        if (error) this.log.debug(error);
        resolve(error ? { ...outcome, error } : outcome);
      };

      const timer = setTimeout(
        () => finish({ tests, timedOut: true }, true),
        timeout,
      );

      try {
        child = fork(CHILD_FILE, [], {
          detached: true,
          execArgv: this.options.nodeTest?.nodeArgs ?? [],
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        });
      } catch (error) {
        finish({ tests, error: String((error as Error)?.stack ?? error) });
        return;
      }

      const captureOutput = (data: Buffer | string) => {
        if (settled) return; // ignore output from a killed-but-not-yet-dead child
        const text = data.toString();
        this.log.trace(text);
        output = (output + text).slice(-OUTPUT_TAIL_LIMIT);
      };
      child.stdout?.on('data', captureOutput);
      child.stderr?.on('data', captureOutput);

      child.on('message', (message: ChildMessage) => {
        if (settled) return;
        if (message.type === 'test') {
          tests.push(message.test);
          if (
            determineHitLimitReached(message.hitCount, spec.hitLimit) ||
            (bail && message.test.status === 'fail')
          ) {
            finish({ tests, hitCount: message.hitCount }, true);
          }
        } else if (message.type === 'done') {
          finish({
            tests,
            coverage: message.coverage,
            hitCount: message.hitCount,
          });
        } else {
          finish({ tests, error: message.error });
        }
      });
      child.on('error', (error) =>
        finish({ tests, error: String(error?.stack ?? error) }),
      );
      child.on('close', (code, signal) =>
        finish({
          tests,
          error: `Test process exited unexpectedly (code ${code}, signal ${signal}) before completing.`,
        }),
      );

      try {
        child.send({
          setupFile: SETUP_FILE,
          namespace: this.globalNamespace,
          activeMutantEnvVar: INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE,
          ...spec,
        });
      } catch (error) {
        finish(
          { tests, error: String((error as Error)?.stack ?? error) },
          true,
        );
      }
    });
  }

  /** Kill the child's whole process group (Unix) so spawned grandchildren are
   * reaped too; fall back to killing just the child elsewhere. */
  private killGroup(child: ChildProcess) {
    try {
      if (child.pid) process.kill(-child.pid, 'SIGKILL');
    } catch {
      // group may already be gone, or unsupported (e.g. Windows)
    }
    try {
      child.kill('SIGKILL');
    } catch {
      // already dead
    }
  }

  private assertNodeVersion(): void {
    if (!isSupportedNodeVersion(process.versions.node)) {
      throw new Error(
        `@stryker-mutator/node-test-runner requires Node.js >= ${MIN_NODE_VERSION} (found ${process.versions.node}); the test runner's "isolation: none" mode is unavailable on older versions.`,
      );
    }
  }
}
