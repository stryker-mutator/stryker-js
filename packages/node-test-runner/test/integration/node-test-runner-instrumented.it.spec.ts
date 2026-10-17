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

// mutant runs execute whole files, so tests in a file share each other's mutants (count 1)
const expectedCoverage = {
  static: {},
  perTest: {
    [toTestId('tests/math.spec.mjs', 'add')]: {
      '0': 1,
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1,
      '5': 1,
      '6': 1,
      '7': 1,
      '8': 1,
    },
    [toTestId('tests/math.spec.mjs', 'slowAdd')]: {
      '0': 1,
      '1': 1,
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
};

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

  it('should report perTest coverage on dry run, keyed by file-scoped test id and shared per file', async () => {
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    expect(result.mutantCoverage).deep.eq(expectedCoverage);
  });

  it('should key tests declared in a shared helper on the file being run', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({ testFiles: ['tests/grid-*.test.mjs'] });
    await sut.init();

    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    const a = toTestId('tests/grid-a.test.mjs', 'grid: x');
    const b = toTestId('tests/grid-b.test.mjs', 'grid: x');
    expect(result.tests.map((test) => test.id)).deep.eq([a, b]);
    expect(result.mutantCoverage?.perTest).deep.eq({
      [a]: { '9': 1, '10': 1 },
      [b]: { '9': 1, '10': 1 },
    });
  });

  it('should attribute helper-declared failures to the file being run when running concurrently', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({
        testFiles: ['tests/grid-*.test.mjs'],
        concurrency: true,
      });
    await sut.init();

    // Mutant '10' turns `text1 + text2` into `text1 - text2`, breaking both grid tests.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '10' }),
        disableBail: true,
      }),
    );

    assertions.expectKilled(run);
    expect([...run.killedBy].sort()).deep.eq([
      toTestId('tests/grid-a.test.mjs', 'grid: x'),
      toTestId('tests/grid-b.test.mjs', 'grid: x'),
    ]);
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
    expect(result.mutantCoverage).deep.eq(expectedCoverage);
  });

  it('should not ship coverage when coverageAnalysis is "off" on instrumented code', async () => {
    // instrumented code lazily re-creates the coverage object; the child must gate on collectCoverage
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'off' }),
    );

    assertions.expectCompleted(result);
    expect(result.mutantCoverage).eq(undefined);
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

  it('should hand coverage back to the parent test after an awaited subtest', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({ testFiles: ['tests/subtest.test.mjs'] });
    await sut.init();

    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    // `add` is called once in the subtest and once after it, in the parent
    expect(result.mutantCoverage).deep.eq({
      static: {},
      perTest: {
        [toTestId('tests/subtest.test.mjs', 'parent > child')]: {
          '0': 1,
          '1': 1,
        },
        [toTestId('tests/subtest.test.mjs', 'parent')]: { '0': 1, '1': 1 },
      },
    });
  });

  it('should keep coverage of instrumented code that a preload already imported', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({
        testFiles: ['tests/math.spec.mjs'],
        nodeArgs: ['--import', './preload.mjs'],
      });
    await sut.init();

    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    const add = toTestId('tests/math.spec.mjs', 'add');
    const slowAdd = toTestId('tests/math.spec.mjs', 'slowAdd');
    expect(result.mutantCoverage).deep.eq({
      static: {},
      perTest: {
        [add]: expectedCoverage.perTest[add],
        [slowAdd]: expectedCoverage.perTest[slowAdd],
      },
    });
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

  it('should not activate a runtime mutant until the SUT is imported', async () => {
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '0' }),
        mutantActivation: 'runtime',
      }),
    );

    assertions.expectSurvived(run);
  });

  it('should activate a runtime mutant while the tests run', async () => {
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '1' }),
        mutantActivation: 'runtime',
      }),
    );

    assertions.expectKilled(run);
  });

  it('should kill a static mutant in code that a preload already imported', async () => {
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({
        testFiles: ['tests/**/*.spec.mjs'],
        nodeArgs: ['--import', './preload.mjs'],
      });
    await sut.init();

    // The preload evaluates `6 * 7` before the runner starts, so the mutant
    // has to be active from process start, not just before the tests import.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '0' }),
        mutantActivation: 'static',
      }),
    );

    assertions.expectKilled(run);
  });
});

describe('node-test-runner running TypeScript through type stripping', () => {
  let sut: NodeTestRunner;
  let sandbox: TempTestDirectorySandbox;
  const addId = toTestId('tests/math.spec.ts', 'add');

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('typescript-instrumented');
    await sandbox.init();
    (testInjector.options as NodeTestRunnerOptionsWithStrykerOptions).nodeTest =
      nodeTestRunnerOptions({
        testFiles: ['tests/**/*.spec.ts'],
        nodeArgs: ['--experimental-strip-types'],
      });
    sut = testInjector.injector.injectFunction(
      createNodeTestRunnerFactory('__stryker2__'),
    );
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should report perTest coverage for a .ts test file', async () => {
    const result = await sut.dryRun(
      factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
    );

    assertions.expectCompleted(result);
    expect(result.mutantCoverage).deep.eq({
      static: {},
      perTest: { [addId]: { '0': 1, '1': 1 } },
    });
  });

  it('should kill a mutant in a .ts source file', async () => {
    // Mutant '1' turns `a + b` into `a - b`, breaking the `add` test.
    const run = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '1' }),
        testFilter: [addId],
      }),
    );

    assertions.expectKilled(run);
    expect(run.killedBy).deep.eq([addId]);
  });
});
