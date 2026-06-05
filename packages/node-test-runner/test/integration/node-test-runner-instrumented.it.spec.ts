import { expect } from 'chai';
import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';

import {
  NodeTestRunner,
  createNodeTestRunnerFactory,
} from '../../src/index.js';
import { NodeTestRunnerOptionsWithStrykerOptions } from '../../src/node-test-runner-options-with-stryker-options.js';
import { toTestId } from '../../src/test-id.js';
import { nodeTestRunnerOptions } from '../helpers/factory.js';

describe('node-test-runner running on an instrumented project', () => {
  let sut: NodeTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example-instrumented');
    await sandbox.init();
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({ testFiles: ['tests/**/*.spec.mjs'] });
    sut = testInjector.injector.injectFunction(
      createNodeTestRunnerFactory('__stryker2__'),
    );
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should report perTest coverage on dry run, keyed by file-scoped test id', async () => {
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    expect(result.mutantCoverage).deep.eq({
      static: {},
      perTest: {
        [toTestId('tests/math.spec.mjs', 'add')]: { '0': 1, '1': 1 },
        [toTestId('tests/math.spec.mjs', 'slowAdd')]: {
          '2': 1,
          '3': 6,
          '4': 6,
          '5': 6,
          '6': 5,
          '7': 5,
          '8': 5,
        },
        [toTestId('tests/formatter.spec.mjs', 'concat')]: { '9': 1, '10': 1 },
      },
    });
  });

  it('should kill a mutant when an activated mutant breaks a test', async () => {
    await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));

    // Mutant '1' turns `a + b` into `a - b`, breaking the `add` test.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '1' }) }),
    );

    assertions.expectKilled(run);
    expect(run.killedBy).deep.eq([toTestId('tests/math.spec.mjs', 'add')]);
  });

  it('should report a timeout when the hit limit is reached', async () => {
    await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));

    // Mutant '7' flips `result += 1` to `result -= 1` inside the slowAdd loop,
    // which is hit 5 times — exceeding a hit limit of 3.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        hitLimit: 3,
        activeMutant: factory.mutant({ id: '7' }),
      }),
    );

    assertions.expectTimeout(run);
    expect(run.reason).contains('Hit limit reached');
  });

  it('should still collect per-test coverage with coverageAnalysis "all"', async () => {
    // The runner attributes coverage per test regardless of mode, so "all"
    // yields the same per-test map as "perTest" (documented behaviour).
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'all' }),
    );

    assertions.expectCompleted(result);
    expect(result.mutantCoverage).deep.eq({
      static: {},
      perTest: {
        [toTestId('tests/math.spec.mjs', 'add')]: { '0': 1, '1': 1 },
        [toTestId('tests/math.spec.mjs', 'slowAdd')]: {
          '2': 1,
          '3': 6,
          '4': 6,
          '5': 6,
          '6': 5,
          '7': 5,
          '8': 5,
        },
        [toTestId('tests/formatter.spec.mjs', 'concat')]: { '9': 1, '10': 1 },
      },
    });
  });

  it('should kill a mutant when concurrency is enabled for the mutant run', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({
        testFiles: ['tests/**/*.spec.mjs'],
        concurrency: true,
      });
    sut = testInjector.injector.injectFunction(
      createNodeTestRunnerFactory('__stryker2__'),
    );
    await sut.init();
    await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));

    // Mutant '1' turns `a + b` into `a - b`, breaking the `add` test — must be
    // killed even though the mutant run executes tests concurrently.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '1' }) }),
    );

    assertions.expectKilled(run);
    expect(run.killedBy).deep.eq([toTestId('tests/math.spec.mjs', 'add')]);
  });
});

describe('node-test-runner running on a project with a static mutant', () => {
  let sut: NodeTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('static-instrumented');
    await sandbox.init();
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({ testFiles: ['tests/**/*.spec.mjs'] });
    sut = testInjector.injector.injectFunction(
      createNodeTestRunnerFactory('__stryker2__'),
    );
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should attribute module-load coverage to `static`, not a test', async () => {
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    // Mutant '0' is the module-level `6 * 7`; it runs at import, before any test,
    // so its coverage lands in `static` rather than under a test id.
    expect(result.mutantCoverage?.static).deep.eq({ '0': 1 });
  });

  it('should kill a static mutant activated before the SUT is imported', async () => {
    // Mutant '0' turns `6 * 7` into `6 / 7` at module load, so `answer` is wrong
    // before the test runs. No testFilter — a static mutant runs against all
    // tests — which exercises the activate-before-import path.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '0' }),
        mutantActivation: 'static',
      }),
    );

    assertions.expectKilled(run);
    expect(run.killedBy).deep.eq([
      toTestId('tests/constants.spec.mjs', 'the answer is 42'),
    ]);
  });
});
