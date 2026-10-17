import path from 'node:path';
import { run } from 'node:test';
import { pathToFileURL } from 'node:url';

import { isSupportedNodeVersion } from '../node-version.js';
import {
  toLateFailure,
  toLoadFailure,
  toReportedTest,
  withMarkedFile,
  type ReportedTest,
  type TestEvent,
} from '../parse-test-event.js';
import { registerHooks } from './setup.js';

interface ChildConfig {
  testFiles: string[];
  namespace: string;
  activeMutantEnvVar: string;
  activeMutant?: string;
  mutantActivation?: 'static' | 'runtime';
  hitLimit?: number;
  collectCoverage: boolean;
  concurrency: boolean;
}

process.once('message', (config: ChildConfig) => {
  const {
    testFiles,
    namespace,
    activeMutantEnvVar,
    activeMutant,
    mutantActivation,
    hitLimit,
    collectCoverage,
    concurrency,
  } = config;

  const g = globalThis as Record<string, unknown>;
  g.__STRYKER_NS__ = namespace;
  // a preload (nodeArgs --import) may have loaded instrumented code that already holds
  // this object and its coverage, so add to it rather than replace it
  const ns = (g[namespace] ??= {}) as {
    activeMutant?: string;
    mutantCoverage?: unknown;
    hitCount?: number;
    hitLimit?: number;
  };
  ns.hitLimit = hitLimit;
  ns.hitCount = 0;
  if (collectCoverage) ns.mutantCoverage ??= { static: {}, perTest: {} };
  const activate = () => {
    if (activeMutant === undefined) return;
    ns.activeMutant = activeMutant;
    process.env[activeMutantEnvVar] = activeMutant;
  };
  // runtime: the setup file's beforeEach activates once every file is imported
  if (mutantActivation === 'runtime') g.__STRYKER_ACTIVATE__ = activate;
  else activate();

  const cwd = process.cwd();
  const send = (message: unknown) => process.send?.(message);

  const finish = (message: unknown) => {
    if (process.send) {
      process.send(message, () => process.exit(0));
    } else {
      process.exit(0);
    }
  };

  try {
    const stream = run({ files: testFiles, isolation: 'none', concurrency });
    registerHooks();

    // a test's file marker is the event right after it, so hold each test for one event
    let pending: { test: ReportedTest; hitCount?: number } | undefined;
    const failedNames = new Set<string>();
    const lateErrors: string[] = [];
    const flush = () => {
      if (pending?.test.status === 'fail') failedNames.add(pending.test.name);
      if (pending) send({ type: 'test', ...pending });
      pending = undefined;
    };
    stream.on('data', (event: TestEvent) => {
      if (
        event.type === 'test:diagnostic' &&
        event.data.message?.includes(
          'asynchronous activity after the test ended',
        )
      ) {
        lateErrors.push(event.data.message);
      }
      if (pending) {
        pending.test = withMarkedFile(event, pending.test) ?? pending.test;
        flush();
      }
      const test = toReportedTest(event, cwd);
      if (test) pending = { test, hitCount: ns.hitCount };
    });
    // node < 26.12 drops a file's load error once it has declared a test (nodejs/node#66549);
    // re-importing rethrows the cached error without re-running the file
    const loadFailures = async (): Promise<ReportedTest[]> => {
      if (isSupportedNodeVersion(process.versions.node, '26.12.0')) return [];
      const loads = await Promise.allSettled(
        testFiles.map((file) => import(pathToFileURL(path.resolve(file)).href)),
      );
      // node already reports a file that throws before declaring a test
      return loads.flatMap((load, i) =>
        load.status === 'rejected' && !failedNames.has(testFiles[i])
          ? [toLoadFailure(testFiles[i], load.reason)]
          : [],
      );
    };
    stream.on('end', () => {
      flush();
      void loadFailures().then((failures) => {
        // node sets a failing exit code for an error it couldn't pin on a test
        if (process.exitCode && !failedNames.size && !failures.length) {
          failures.push(toLateFailure(lateErrors));
        }
        for (const test of failures) {
          send({ type: 'test', hitCount: ns.hitCount, test });
        }
        finish({
          type: 'done',
          // gate on the flag: instrumented code lazily re-creates ns.mutantCoverage
          coverage: collectCoverage ? ns.mutantCoverage : undefined,
          hitCount: ns.hitCount,
        });
      });
    });
    stream.on('error', (error: Error) =>
      finish({ type: 'error', error: String(error?.stack ?? error) }),
    );
  } catch (error) {
    finish({ type: 'error', error: String((error as Error)?.stack ?? error) });
  }
});
