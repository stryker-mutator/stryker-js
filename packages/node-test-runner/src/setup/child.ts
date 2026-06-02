// Runs one dryRun/mutantRun, forked as a *detached* child process (its own
// process group) so the parent can kill the whole group to (a) stop the run on
// the first failure when bailing — `AbortController` is ignored under
// isolation:'none' — and (b) reap any child processes the tests spawned when a
// run times out. node:test's run() is not re-entrant (ESM can't be unloaded),
// so a fresh process per run is what gives a clean test registry each time;
// isolation:'none' keeps the instrumented SUT and the Stryker global in *this*
// process so a mutant can be activated and coverage read.
import path from 'node:path';
import { run } from 'node:test';

import { toTestId } from '../test-id.js';

/** The subset of a node:test reporter event that this runner reads. */
interface TestEvent {
  type: string;
  data: {
    name: string;
    file?: string;
    details?: {
      duration_ms?: number;
      error?: { message?: string } | string;
    };
  };
}

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
  // Tell setup.ts which namespace to write currentTestId into.
  g.__STRYKER_NS__ = namespace;
  // Activate before the SUT is imported (during run()), so static mutants — code
  // that runs at module load — are already switched on.
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
  const toRelative = (file?: string): string | undefined =>
    file ? path.relative(cwd, file).split(path.sep).join('/') : undefined;
  const isSetup = (file?: string): boolean =>
    !!file && path.resolve(file) === path.resolve(setupFile);

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
      const d = event.data;
      if (
        (event.type === 'test:pass' || event.type === 'test:fail') &&
        !isSetup(d.file)
      ) {
        const file = toRelative(d.file);
        const failed = event.type === 'test:fail';
        const error = d.details?.error;
        const failureMessage =
          typeof error === 'string' ? error : (error?.message ?? 'test failed');
        send({
          type: 'test',
          hitCount: ns.hitCount,
          test: {
            id: toTestId(file ?? '', d.name),
            name: d.name,
            file,
            status: failed ? 'fail' : 'pass',
            timeSpentMs: d.details?.duration_ms ?? 0,
            failureMessage: failed ? failureMessage : undefined,
          },
        });
      }
    });
    stream.on('end', () =>
      finish({
        type: 'done',
        coverage: ns.mutantCoverage,
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
