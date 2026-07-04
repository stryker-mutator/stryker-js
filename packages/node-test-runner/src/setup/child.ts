import { run } from 'node:test';

import { toReportedTest, type TestEvent } from '../parse-test-event.js';

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
      // `isolation`/`concurrency` are valid run() options; cast for older defs.
      isolation: 'none',
      concurrency,
    } as Parameters<typeof run>[0]);

    stream.on('data', (event: TestEvent) => {
      const test = toReportedTest(event, cwd, setupFile);
      if (test) send({ type: 'test', hitCount: ns.hitCount, test });
    });
    stream.on('end', () =>
      finish({
        type: 'done',
        // gate on the flag: instrumented code lazily re-creates ns.mutantCoverage
        coverage: collectCoverage ? ns.mutantCoverage : undefined,
        hitCount: ns.hitCount,
      }),
    );
    stream.on('error', (error: Error) =>
      finish({ type: 'error', error: String(error?.stack ?? error) }),
    );
  } catch (error) {
    finish({ type: 'error', error: String((error as Error)?.stack ?? error) });
  }
});
