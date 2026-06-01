import { expect } from 'chai';
import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { DryRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import {
  NodeTestRunner,
  createNodeTestRunnerFactory,
} from '../../src/index.js';
import { NodeTestRunnerOptionsWithStrykerOptions } from '../../src/node-test-runner-options-with-stryker-options.js';
import { nodeTestRunnerOptions } from '../helpers/factory.js';

describe('node-test-runner integration', () => {
  let sut: NodeTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: NodeTestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as NodeTestRunnerOptionsWithStrykerOptions;
    options.nodeTest = nodeTestRunnerOptions({
      testFiles: ['tests/**/*.spec.mjs'],
    });
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  describe('Running in an example project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('example');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(
        createNodeTestRunnerFactory('__stryker2__'),
      );
      await sut.init();
    });

    it('should complete a dry run', async () => {
      const run = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(run);
    });

    it('should report the discovered tests on dry run', async () => {
      const run = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(run);
      expect(run.tests.map((test) => test.name).sort()).deep.eq([
        'add',
        'concat',
        'slowAdd',
        'this test always fails',
      ]);
    });

    it('should discover tests with the default globs when none are configured', async () => {
      options.nodeTest = nodeTestRunnerOptions({ testFiles: undefined });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(run);
      expect(run.tests.length).greaterThan(0);
    });

    it('should report a valid timeSpentMs', async () => {
      const run = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(run);
      expect(run.tests.every((test) => test.timeSpentMs >= 0)).eq(true);
    });

    it('should run only the covering file and survive when its tests pass', async () => {
      const dry = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
      );
      assertions.expectCompleted(dry);
      const mathTestIds = dry.tests
        .filter((test) => test.fileName === 'tests/math.spec.mjs')
        .map((test) => test.id);

      const run = await sut.mutantRun(
        factory.mutantRunOptions({ testFilter: mathTestIds }),
      );

      assertions.expectSurvived(run);
      // Only math.spec.mjs (2 tests) ran — proof the file filter narrowed the run.
      expect(run.nrOfTests).eq(2);
    });

    it('should kill a mutant run when a covering test fails', async () => {
      const dry = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'perTest' }),
      );
      assertions.expectCompleted(dry);
      const failing = dry.tests.find(
        (test) => test.fileName === 'tests/failing.spec.mjs',
      )!;

      const run = await sut.mutantRun(
        factory.mutantRunOptions({ testFilter: [failing.id] }),
      );

      assertions.expectKilled(run);
      expect(run.killedBy).deep.eq([failing.id]);
    });
  });

  describe('Running on a bogus project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('bogus');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(
        createNodeTestRunnerFactory('__stryker2__'),
      );
    });

    it('should report a failing test for a non-test file', async () => {
      options.nodeTest = nodeTestRunnerOptions({ testFiles: ['readme.md'] });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      // node:test imports a markdown file and surfaces it as a failing test
      // rather than crashing the run.
      assertions.expectCompleted(run);
      expect(run.tests.some((test) => test.status === TestStatus.Failed)).eq(
        true,
      );
    });

    it('should time out a run that exceeds the timeout', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['slow.spec.mjs'],
      });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions({ timeout: 500 }));

      // The process group is killed once the timeout elapses.
      expect(run.status).eq(DryRunStatus.Timeout);
    });

    it('should report an error when the test process exits unexpectedly', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['exits.spec.mjs'],
      });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      // A test that calls process.exit must not look like a clean (empty) run.
      assertions.expectErrored(run);
      expect(run.errorMessage).contains('exited unexpectedly');
    });

    it('should pass nodeArgs to the test process', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['slow.spec.mjs'],
        nodeArgs: ['--not-a-real-node-flag-xyz'],
      });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      // A bad node arg makes the forked process fail to start, proving the args
      // actually reach it.
      assertions.expectErrored(run);
    });
  });

  describe('Bailing', () => {
    // bail.spec.mjs: "a fails fast" then "b is slow" (3s).
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('bogus');
      await sandbox.init();
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['bail.spec.mjs'],
      });
      sut = testInjector.injector.injectFunction(
        createNodeTestRunnerFactory('__stryker2__'),
      );
      await sut.init();
    });

    it('should stop on the first failure when bail is enabled', async () => {
      const run = await sut.mutantRun(
        factory.mutantRunOptions({ disableBail: false, timeout: 8000 }),
      );

      assertions.expectKilled(run);
      // The slow test is killed mid-run, so only the first (failing) test ran.
      expect(run.nrOfTests).eq(1);
    });

    it('should run every test when bail is disabled', async () => {
      const run = await sut.mutantRun(
        factory.mutantRunOptions({ disableBail: true, timeout: 8000 }),
      );

      assertions.expectKilled(run);
      // Both the failing and the slow-but-passing test ran.
      expect(run.nrOfTests).eq(2);
    });
  });
});
