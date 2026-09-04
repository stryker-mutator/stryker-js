import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

import { schema } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import {
  IncrementalJournal,
  IncrementalJournalMutant,
  INCREMENTAL_PENDING_BASE,
  INCREMENTAL_PENDING_RESULTS,
  incrementalPendingDir,
  incrementalPendingNextDir,
  incrementalPendingPrevDir,
  incrementalTempFile,
  incrementalGitignorePattern,
} from '../../../src/fs/incremental-journal.js';

describe(IncrementalJournal.name, () => {
  let tempDir: string;
  let incrementalFile: string;
  let pendingDir: string;
  let sut: IncrementalJournal;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stryker-journal-'));
    incrementalFile = path.join(tempDir, 'stryker-incremental.json');
    pendingDir = incrementalPendingDir(incrementalFile);
    testInjector.options.incremental = true;
    testInjector.options.incrementalFile = incrementalFile;
    sut = createSut();
  });

  afterEach(async () => {
    sut.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function createSut() {
    return new IncrementalJournal(testInjector.options, testInjector.logger);
  }

  function createBase(
    overrides?: Partial<schema.MutationTestResult>,
  ): schema.MutationTestResult {
    return factory.mutationTestReportSchemaMutationTestResult({
      files: {
        'foo.js': factory.mutationTestReportSchemaFileResult({
          source: 'const answer = 42;',
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: 'plan-1',
              status: 'Ignored',
              mutatorName: 'BlockStatement',
            }),
          ],
        }),
      },
      testFiles: {
        'foo.spec.js': factory.mutationTestReportSchemaTestFile({
          tests: [
            factory.mutationTestReportSchemaTestDefinition({
              id: '0',
              name: 'should work',
            }),
          ],
        }),
      },
      ...overrides,
    });
  }

  function journalMutant(
    overrides?: Partial<IncrementalJournalMutant>,
  ): IncrementalJournalMutant {
    return {
      ...factory.mutationTestReportSchemaMutantResult({
        id: 'run-1',
        status: 'Killed',
        mutatorName: 'EqualityOperator',
        killedBy: ['0'],
      }),
      fileName: 'foo.js',
      ...overrides,
    };
  }

  async function readPendingBase(): Promise<schema.MutationTestResult> {
    const raw = await fs.readFile(
      path.join(pendingDir, INCREMENTAL_PENDING_BASE),
      'utf-8',
    );
    return JSON.parse(raw) as schema.MutationTestResult;
  }

  async function readPendingJsonl(): Promise<string> {
    return fs.readFile(
      path.join(pendingDir, INCREMENTAL_PENDING_RESULTS),
      'utf-8',
    );
  }

  it('should write a valid MutationTestResult and empty JSONL on begin', async () => {
    const base = createBase();
    await sut.begin(base);

    const written = await readPendingBase();
    expect(written).deep.eq(base);
    expect(await readPendingJsonl()).eq('');
    expect(await fileExists(incrementalPendingNextDir(incrementalFile))).false;
  });

  it('should ignore append before begin', async () => {
    sut.append(journalMutant());
    expect(await fileExists(pendingDir)).false;
    expect(await sut.load()).undefined;
  });

  it('should ignore append when incremental is false', async () => {
    testInjector.options.incremental = false;
    sut = createSut();
    const base = createBase();
    await sut.begin(base);
    sut.append(journalMutant());
    expect(await fileExists(pendingDir)).false;
  });

  it('should merge base and journal mutants on load without needing testCoverage', async () => {
    const base = createBase();
    await sut.begin(base);
    sut.append(journalMutant({ id: 'run-1' }));
    sut.append(journalMutant({ id: 'run-2', status: 'Survived' }));
    const recovered = await createSut().load();
    expect(recovered).not.undefined;
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'run-1',
      'run-2',
    ]);
    expect(recovered!.testFiles?.['foo.spec.js'].tests).lengthOf(1);
    expect(
      recovered,
      'load must return a MutationTestResult, not a testCoverage object',
    ).not.to.have.property('testCoverage');
  });

  it('should serialize appends in call order', async () => {
    await sut.begin(createBase());
    const count = 20;
    for (let i = 0; i < count; i++) {
      sut.append(journalMutant({ id: `run-${i}` }));
    }
    const recovered = await createSut().load();
    const ids = recovered!.files['foo.js'].mutants.slice(1).map(({ id }) => id);
    expect(ids).deep.eq([...Array(count).keys()].map((i) => `run-${i}`));
  });

  it('should drop a torn last JSONL line and keep earlier lines', async () => {
    await sut.begin(createBase());
    sut.append(journalMutant({ id: 'run-1' }));
    await fs.appendFile(
      path.join(pendingDir, INCREMENTAL_PENDING_RESULTS),
      '{"id":"torn"',
    );

    const recovered = await createSut().load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'run-1',
    ]);
  });

  it('should fail load on a corrupted interior JSONL line and leave pending on disk', async () => {
    await sut.begin(createBase());
    sut.append(journalMutant({ id: 'run-1' }));
    sut.append(journalMutant({ id: 'run-2' }));
    await fs.writeFile(
      path.join(pendingDir, INCREMENTAL_PENDING_RESULTS),
      '{not-json}\n{"fileName":"foo.js","id":"run-2","status":"Killed","mutatorName":"x","location":{"start":{"line":1,"column":1},"end":{"line":1,"column":2}},"replacement":""}\n',
      'utf-8',
    );

    const recovered = await createSut().load();
    expect(recovered).undefined;
    expect(await fileExists(path.join(pendingDir, INCREMENTAL_PENDING_BASE)))
      .true;
    expect(testInjector.logger.warn).calledWithMatch('corrupted interior line');
  });

  it('should write the incremental file then remove pending on complete', async () => {
    const base = createBase();
    await sut.begin(base);
    sut.append(journalMutant({ id: 'run-1' }));
    const finalReport = createBase({
      files: {
        'foo.js': factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({ id: 'plan-1' }),
            factory.mutationTestReportSchemaMutantResult({ id: 'run-1' }),
          ],
        }),
      },
    });
    await sut.complete(finalReport);

    const committed = JSON.parse(
      await fs.readFile(incrementalFile, 'utf-8'),
    ) as schema.MutationTestResult;
    expect(committed).deep.eq(finalReport);
    expect(await fileExists(pendingDir)).false;
    expect(await fileExists(incrementalTempFile(incrementalFile))).false;
  });

  it('should map incrementalFile to a gitignore glob covering the report and WAL siblings', () => {
    expect(incrementalGitignorePattern('reports/stryker-incremental.json')).eq(
      'reports/stryker-incremental.*',
    );
  });

  it('should set isStarted only after begin succeeds, and clear it on complete', async () => {
    expect(sut.isStarted).false;
    await sut.begin(createBase());
    expect(sut.isStarted).true;
    await sut.complete(createBase());
    expect(sut.isStarted).false;
  });

  it('should recover from pending.prev when pending is missing (crash mid-swap)', async () => {
    await sut.begin(createBase());
    sut.append(journalMutant({ id: 'from-prev' }));
    const prevDir = incrementalPendingPrevDir(incrementalFile);
    await fs.rename(pendingDir, prevDir);

    const nextDir = incrementalPendingNextDir(incrementalFile);
    await fs.mkdir(nextDir, { recursive: true });
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_BASE),
      JSON.stringify(
        createBase({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({
                  id: 'from-next-only',
                }),
              ],
            }),
          },
        }),
      ),
      'utf-8',
    );
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_RESULTS),
      '',
      'utf-8',
    );

    const recovered = await createSut().load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'from-prev',
    ]);
  });

  it('should prefer pending over pending.prev when both exist', async () => {
    await sut.begin(createBase());
    sut.append(journalMutant({ id: 'from-pending' }));
    const prevDir = incrementalPendingPrevDir(incrementalFile);
    await fs.mkdir(prevDir, { recursive: true });
    await fs.writeFile(
      path.join(prevDir, INCREMENTAL_PENDING_BASE),
      JSON.stringify(
        createBase({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({
                  id: 'from-prev-only',
                }),
              ],
            }),
          },
        }),
      ),
      'utf-8',
    );
    await fs.writeFile(
      path.join(prevDir, INCREMENTAL_PENDING_RESULTS),
      '',
      'utf-8',
    );

    const recovered = await createSut().load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'from-pending',
    ]);
  });

  it('should recover from pending.next when pending and prev are missing (crash before first swap)', async () => {
    const nextDir = incrementalPendingNextDir(incrementalFile);
    await fs.mkdir(nextDir, { recursive: true });
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_BASE),
      JSON.stringify(createBase()),
      'utf-8',
    );
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_RESULTS),
      `${JSON.stringify(journalMutant({ id: 'from-next' }))}\n`,
      'utf-8',
    );

    const recovered = await createSut().load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'from-next',
    ]);
  });

  it('should promote pending.next to pending so begin cannot delete recovered mutants', async () => {
    const nextDir = incrementalPendingNextDir(incrementalFile);
    await fs.mkdir(nextDir, { recursive: true });
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_BASE),
      JSON.stringify(createBase()),
      'utf-8',
    );
    await fs.writeFile(
      path.join(nextDir, INCREMENTAL_PENDING_RESULTS),
      `${JSON.stringify(journalMutant({ id: 'from-next' }))}\n`,
      'utf-8',
    );

    const recovered = await sut.load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-1',
      'from-next',
    ]);
    expect(await fileExists(pendingDir)).true;
    expect(await fileExists(nextDir)).false;

    // `begin()` deletes `.next` first. After promote, that wipe must not drop the WAL.
    await fs.rm(nextDir, { recursive: true, force: true });
    expect(
      (await createSut().load())!.files['foo.js'].mutants.map(({ id }) => id),
    ).deep.eq(['plan-1', 'from-next']);

    await sut.begin(
      createBase({
        files: {
          'foo.js': factory.mutationTestReportSchemaFileResult({
            mutants: [
              factory.mutationTestReportSchemaMutantResult({
                id: 'plan-from-b',
              }),
            ],
          }),
        },
      }),
    );
    expect(sut.isStarted).true;
    expect(
      (await readPendingBase()).files['foo.js'].mutants.map(({ id }) => id),
    ).deep.eq(['plan-from-b']);
  });

  it('should replace pending with a new base and empty journal so old JSONL is not mixed in', async () => {
    const firstBase = createBase();
    await sut.begin(firstBase);
    sut.append(journalMutant({ id: 'from-run-a' }));
    const secondBase = createBase({
      files: {
        'foo.js': factory.mutationTestReportSchemaFileResult({
          source: 'const answer = 43;',
          mutants: [
            factory.mutationTestReportSchemaMutantResult({
              id: 'plan-from-b',
              status: 'NoCoverage',
            }),
          ],
        }),
      },
    });
    await sut.begin(secondBase);

    expect(await readPendingBase()).deep.eq(secondBase);
    expect(await readPendingJsonl()).eq('');
    expect(await fileExists(incrementalPendingPrevDir(incrementalFile))).false;
    expect(await fileExists(incrementalPendingNextDir(incrementalFile))).false;

    const recovered = await createSut().load();
    expect(recovered!.files['foo.js'].mutants.map(({ id }) => id)).deep.eq([
      'plan-from-b',
    ]);
  });

  it('should keep the previous pending pair when begin is never called (crash-before-begin)', async () => {
    const committed = createBase();
    await sut.complete(committed);

    const nextRun = createSut();
    expect(await nextRun.load()).undefined;
    expect(JSON.parse(await fs.readFile(incrementalFile, 'utf-8'))).deep.eq(
      committed,
    );
  });

  it('should not destroy an existing pending pair if begin never runs after a previous crash', async () => {
    await sut.begin(createBase());
    sut.append(journalMutant({ id: 'run-1' }));
    const nextRun = createSut();
    expect(await nextRun.load()).not.undefined;
    expect(
      (await nextRun.load())!.files['foo.js'].mutants.map(({ id }) => id),
    ).deep.eq(['plan-1', 'run-1']);
  });

  it('should no-op load when incremental is false', async () => {
    await sut.begin(createBase());
    testInjector.options.incremental = false;
    const disabled = createSut();
    expect(await disabled.load()).undefined;
  });
});

async function fileExists(fileName: string): Promise<boolean> {
  try {
    await fs.access(fileName);
    return true;
  } catch {
    return false;
  }
}
