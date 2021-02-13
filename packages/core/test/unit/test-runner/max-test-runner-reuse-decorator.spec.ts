import { TestRunner } from '@stryker-mutator/api/test-runner';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { MaxTestRunnerReuseDecorator } from '../../../src/test-runner/max-test-runner-reuse-decorator';
import { TestRunnerDecorator } from '../../../src/test-runner/test-runner-decorator';

describe(MaxTestRunnerReuseDecorator.name, () => {
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner>>;
  const runOptions = factory.mutantRunOptions({ timeout: 23 });

  beforeEach(() => {
    testRunner = factory.testRunner();
  });

  const getSut = (maxTestRunnerReuse: number) => {
    const sut = new MaxTestRunnerReuseDecorator(() => testRunner, { maxTestRunnerReuse: maxTestRunnerReuse });
    sinon.spy(sut, 'dispose');
    return sut;
  };

  it('should not override `init`', () => {
    expect(getSut(1).init).to.be.eq(TestRunnerDecorator.prototype.init);
  });

  it('should override `dispose`', () => {
    expect(getSut(1).dispose).to.not.be.eq(TestRunnerDecorator.prototype.dispose);
  });

  it('should not override `dryRun`', () => {
    expect(getSut(1).dryRun).to.be.eq(TestRunnerDecorator.prototype.dryRun);
  });

  it('should pass through resolved values', async () => {
    const sut = getSut(0);
    const options = factory.mutantRunOptions({ timeout: 23 });
    const expectedResult = factory.killedMutantRunResult();
    testRunner.mutantRun.resolves(expectedResult);
    const result = await sut.mutantRun(options);
    expect(testRunner.mutantRun).to.have.been.calledWith(options);
    expect(result).to.eq(expectedResult);
  });

  it('should not dispose worker if restartAfterRuns is set to 0', async () => {
    const sut = getSut(0);
    const expectedResult = factory.killedMutantRunResult();
    testRunner.mutantRun.resolves(expectedResult);

    await sut.mutantRun(runOptions);
    const result = await sut.mutantRun(runOptions);

    expect(sut.dispose).to.have.been.callCount(0);
    expect(result).to.eq(expectedResult);
  });

  it('should dispose worker on second run if restartAfterRuns is set to 1', async () => {
    const sut = getSut(1);
    const expectedResult = factory.killedMutantRunResult();
    testRunner.mutantRun.resolves(expectedResult);

    await sut.mutantRun(runOptions);
    const result = await sut.mutantRun(runOptions);

    expect(sut.dispose).to.have.been.callCount(1);
    expect(result).to.eq(expectedResult);
  });

  it('should correctly reset runs after dispose', async () => {
    const sut = getSut(2);

    await sut.mutantRun(runOptions);
    expect(sut.runs).to.equal(1);
    await sut.dispose();
    expect(sut.runs).to.equal(0);
  });

  it('should correctly reset runs after running more than maximum run', async () => {
    const sut = getSut(2);

    await sut.mutantRun(runOptions);
    expect(sut.runs).to.equal(1);
    await sut.mutantRun(runOptions);
    expect(sut.runs).to.equal(2);
    await sut.mutantRun(runOptions);
    expect(sut.runs).to.equal(1);
  });
});
