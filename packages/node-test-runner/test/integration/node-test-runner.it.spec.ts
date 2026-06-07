import { expect } from 'chai';
import sinon from 'sinon';
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
import { toTestId } from '../../src/test-id.js';
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
      // Files were discovered, so the no-test-files warning must not fire.
      expect(testInjector.logger.warn).not.called;
    });

    it('should report the reloadEnvironment capability', () => {
      expect(sut.capabilities()).deep.eq({ reloadEnvironment: true });
    });

    it('should not collect coverage when coverageAnalysis is "off"', async () => {
      const run = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'off' }),
      );

      assertions.expectCompleted(run);
      expect(run.mutantCoverage).eq(undefined);
    });

    it('should not signal the process group on a clean completion', async () => {
      const killSpy = sinon.spy(process, 'kill');

      await sut.dryRun(factory.dryRunOptions());

      // The child exits itself after a clean run, so signalling its process
      // group (negative pid) is unnecessary — and unsafe once the pid is freed
      // and possibly reused. Only still-running children are killed.
      const signalledGroup = killSpy
        .getCalls()
        .some((call) => typeof call.args[0] === 'number' && call.args[0] < 0);
      expect(signalledGroup).eq(false);
    });

    it('should discover tests with the default globs when none are configured', async () => {
      options.nodeTest = nodeTestRunnerOptions({ testFiles: undefined });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(run);
      expect(run.tests.length).greaterThan(0);
    });

    it('should warn when no test files are discovered', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['no-such-dir/**/*.spec.mjs'],
      });

      await sut.init();

      expect(testInjector.logger.warn).calledWithMatch(/No test files found/);
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

      const killSpy = sinon.spy(process, 'kill');
      const run = await sut.dryRun(factory.dryRunOptions({ timeout: 500 }));

      // The process is still running when the timeout elapses, so its group is
      // signalled (negative pid, SIGKILL) to stop the remaining tests.
      expect(run.status).eq(DryRunStatus.Timeout);
      const signalledGroup = killSpy
        .getCalls()
        .some(
          (call) =>
            typeof call.args[0] === 'number' &&
            call.args[0] < 0 &&
            call.args[1] === 'SIGKILL',
        );
      expect(signalledGroup).eq(true);
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

    it('should kill the mutant when the test process exits with a non-zero code', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['exits-nonzero.spec.mjs'],
      });
      await sut.init();

      const run = await sut.mutantRun(factory.mutantRunOptions());

      assertions.expectKilled(run);
    });

    it('should not turn a zero-exit crash into a false kill on a mutant run', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['exits.spec.mjs'], // calls process.exit(0)
      });
      await sut.init();

      const run = await sut.mutantRun(factory.mutantRunOptions());

      // A clean (zero) exit code is ambiguous — an early *success* exit is not
      // evidence the mutant was detected, so it must stay an error, never a
      // (false) kill.
      assertions.expectErrored(run);
    });

    it('should surface the test process stdout and stderr in the crash error', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['prints-then-exits.spec.mjs'],
      });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      // stdout must not be discarded and stderr must not be raw-inherited into
      // Stryker's own output — both are captured and surfaced on a crash.
      assertions.expectErrored(run);
      expect(run.errorMessage).contains('STDOUT_MARKER_NTR');
      expect(run.errorMessage).contains('STDERR_MARKER_NTR');
    });

    it('should forward the test process output to the trace log', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['prints-then-exits.spec.mjs'],
      });
      await sut.init();

      await sut.dryRun(factory.dryRunOptions());

      // 'close' fires only after the piped stdio has flushed, so every chunk
      // has been forwarded by the time the run resolves.
      expect(testInjector.logger.trace).calledWithMatch(/STDOUT_MARKER_NTR/);
    });

    it('should log the crash error at debug level', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['exits.spec.mjs'],
      });
      await sut.init();

      await sut.dryRun(factory.dryRunOptions());

      expect(testInjector.logger.debug).calledWithMatch(/exited unexpectedly/);
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

  describe('Grouped and nested tests', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('grouped');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(
        createNodeTestRunnerFactory('__stryker2__'),
      );
    });

    it('should not report describe/it suite containers as tests', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['tests/groups.spec.mjs'],
      });
      await sut.init();

      const run = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(run);
      // The `describe('outer suite')` container is dropped; its `it`s, the
      // `test()` parent, and its subtest are all reported.
      expect(run.tests.map((test) => test.name).sort()).deep.eq([
        'nested child',
        'parent test',
        'passes a',
        'passes b',
      ]);
    });

    it('should attribute a killing failure to the leaf test, not its suite', async () => {
      options.nodeTest = nodeTestRunnerOptions({
        testFiles: ['tests/failing-group.spec.mjs'],
      });
      await sut.init();

      // disableBail so every event flows: the leaf fails and the suite bubbles
      // up a `subtestsFailed` failure that must be filtered out of killedBy.
      const run = await sut.mutantRun(
        factory.mutantRunOptions({ disableBail: true }),
      );

      assertions.expectKilled(run);
      expect(run.killedBy).deep.eq([
        toTestId('tests/failing-group.spec.mjs', 'this nested test fails'),
      ]);
    });
  });
});

describe('node-test-runner Node.js version gating', () => {
  it('should reject init() on an unsupported Node.js version', async () => {
    const sut = testInjector.injector.injectFunction(
      createNodeTestRunnerFactory('__stryker2__'),
    );
    // The version check runs first in init(), before any file discovery.
    sinon
      .stub(process, 'versions')
      .value({ ...process.versions, node: '21.0.0' });

    await expect(sut.init()).rejectedWith(/requires Node\.js >=/);
  });
});
