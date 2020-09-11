import { TestRunner2, DryRunOptions, MutantRunOptions, DryRunResult, MutantRunResult } from '@stryker-mutator/api/test_runner';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { factory } from '@stryker-mutator/test-helpers';

import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';
import RestartWorkerDecorator from '../../../src/test-runner/RestartWorkerDecorator';

describe(RestartWorkerDecorator.name, () => {
  let workerWithoutRestarts: RestartWorkerDecorator;
  let workerWithRestarts: RestartWorkerDecorator;
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    testRunner = factory.testRunner();
    workerWithoutRestarts = new RestartWorkerDecorator(() => testRunner, { restartAfterRuns: 0 });
    workerWithRestarts = new RestartWorkerDecorator(() => testRunner, { restartAfterRuns: 1 });

    sandbox.spy(workerWithoutRestarts, 'dispose');
    sandbox.spy(workerWithRestarts, 'dispose');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not override `init`', () => {
    expect(workerWithoutRestarts.init).to.be.eq(TestRunnerDecorator.prototype.init);
  });

  it('should override `dispose`', () => {
    expect(workerWithoutRestarts.dispose).to.not.be.eq(TestRunnerDecorator.prototype.dispose);
  });

  it('should not override `dryRun`', () => {
    expect(workerWithoutRestarts.dryRun).to.be.eq(TestRunnerDecorator.prototype.dryRun);
  });

  describeRun(
    'mutantRun',
    (sut, options) => sut.mutantRun(options),
    () => factory.mutantRunOptions({ timeout: 23 })
  );

  interface RunOptionsByMethod {
    dryRun: DryRunOptions;
    mutantRun: MutantRunOptions;
  }
  interface RunResultByMethod {
    dryRun: DryRunResult;
    mutantRun: MutantRunResult;
  }

  function describeRun<T extends keyof RunOptionsByMethod>(
    runMethod: T,
    act: (sut: RestartWorkerDecorator, options: RunOptionsByMethod[T]) => Promise<RunResultByMethod[T]>,
    optionsFactory: () => RunOptionsByMethod[T]
  ) {
    describe(runMethod, () => {
      let options: RunOptionsByMethod[T];

      beforeEach(() => {
        options = optionsFactory();
      });

      it('should pass through resolved values', async () => {
        const expectedResult = factory.completeDryRunResult();
        testRunner[runMethod].resolves(expectedResult);
        const result = await act(workerWithoutRestarts, options);
        expect(testRunner[runMethod]).to.have.been.calledWith(options);
        expect(result).to.eq(expectedResult);
      });

      it('should not dispose worker if restartAfterRuns is set to 0', async () => {
        const expectedResult = factory.completeDryRunResult();
        testRunner[runMethod].resolves(expectedResult);

        const result = await act(workerWithRestarts, options);

        expect(workerWithRestarts.dispose).to.have.been.callCount(0);
        expect(result).to.eq(expectedResult);
      });

      it('should dispose worker on second run if restartAfterRuns is set to 1', async () => {
        const expectedResult = factory.completeDryRunResult();
        testRunner[runMethod].resolves(expectedResult);

        await act(workerWithRestarts, options);
        const result = await act(workerWithRestarts, options);

        expect(workerWithRestarts.dispose).to.have.been.callCount(1);
        expect(result).to.eq(expectedResult);
      });
    });
  }
});
