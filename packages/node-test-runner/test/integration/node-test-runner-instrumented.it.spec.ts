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
});
