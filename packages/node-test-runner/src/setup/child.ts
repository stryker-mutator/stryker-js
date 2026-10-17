import path from 'node:path';
import { run } from 'node:test';
import { pathToFileURL } from 'node:url';

import { isSupportedNodeVersion } from '../node-version.js';
import {
  toLoadFailure,
  toReportedTest,
  withMarkedFile,
  type ReportedTest,
  type TestEvent,
} from '../parse-test-event.js';

interface ChildConfig {
  setupFile: string;
  testFiles: string[];
  namespace: string;
  activeMutantEnvVar: string;
  activeMutant?: string;
  hitLimit?: number;
  collectCoverage: boolean;
  concurrency: boolean;
}

process.once('message', (config: ChildConfig) => {
  const {
    setupFile,
    testFiles,
    namespace,
    activeMutantEnvVar,
    activeMutant,
    hitLimit,
    collectCoverage,
    concurrency,
  } = config;

  const g = globalThis as Record<string, unknown>;
  g.__STRYKER_NS__ = namespace;
  if (activeMutant !== undefined)
    process.env[activeMutantEnvVar] = activeMutant;
  g[namespace] = {
    activeMutant,
    hitLimit,
    hitCount: 0,
    mutantCoverage: collectCoverage ? { static: {}, perTest: {} } : undefined,
  };
  const ns = g[namespace] as { mutantCoverage?: unknown; hitCount?: number };

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
    const stream = run({
      files: [setupFile, ...testFiles],
      isolation: 'none',
      concurrency,
    });

    // a test's file marker is the event right after it, so hold each test for one event
    let pending: { test: ReportedTest; hitCount?: number } | undefined;
    const failedNames = new Set<string>();
    const flush = () => {
      if (pending?.test.status === 'fail') failedNames.add(pending.test.name);
      if (pending) send({ type: 'test', ...pending });
      pending = undefined;
    };
    stream.on('data', (event: TestEvent) => {
      if (pending) {
        pending.test = withMarkedFile(event, pending.test) ?? pending.test;
        flush();
      }
      const test = toReportedTest(event, cwd, setupFile);
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
