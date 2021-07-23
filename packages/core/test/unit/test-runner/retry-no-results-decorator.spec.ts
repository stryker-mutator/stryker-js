import { TestRunner } from '@stryker-mutator/api/test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { RetryNoResultsDecorator } from '../../../src/test-runner/retry-no-results-decorator';

describe(RetryNoResultsDecorator.name, () => {
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let testRunner3: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let innerTestRunnerFactoryMethodStub: sinon.SinonStub<[], TestRunner>;
  let sut: RetryNoResultsDecorator;

  beforeEach(() => {
    innerTestRunnerFactoryMethodStub = sinon.stub();
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    testRunner3 = factory.testRunner();
    innerTestRunnerFactoryMethodStub.onFirstCall().returns(testRunner1).onSecondCall().returns(testRunner2).onThirdCall().returns(testRunner3);
    sut = new RetryNoResultsDecorator(innerTestRunnerFactoryMethodStub, testInjector.logger);
  });

  it('should passthrough during normal completion', async () => {
    // Arrange
    const expectedResult = factory.survivedMutantRunResult({ nrOfTests: 1 });
    testRunner1.mutantRun.resolves(expectedResult);
    const runOptions = factory.mutantRunOptions();

    // Act
    const actualResult = await sut.mutantRun(runOptions);

    // Assert
    expect(actualResult).eq(expectedResult);
    expect(testRunner1.mutantRun).calledWith(runOptions);
    expect(testInjector.logger.debug).not.called;
  });

  it('should retry when results are empty', async () => {
    // Arrange
    const expectedResult = factory.survivedMutantRunResult({ nrOfTests: 1 });
    const firstResult = factory.survivedMutantRunResult({ nrOfTests: 0 });
    testRunner1.mutantRun.resolves(firstResult);
    testRunner2.mutantRun.resolves(expectedResult);
    const runOptions = factory.mutantRunOptions();

    // Act
    const actualResult = await sut.mutantRun(runOptions);

    // Assert
    expect(actualResult).eq(expectedResult);
    expect(testRunner2.mutantRun).calledWith(runOptions);
  });

  it('should log on debug when retrying', async () => {
    // Arrange
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult({ nrOfTests: 0 }));
    testRunner2.mutantRun.resolves(factory.survivedMutantRunResult({ nrOfTests: 1 }));

    // Act
    await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '4' }) }));

    // Assert
    expect(testInjector.logger.debug).calledOnceWithExactly('Detected an empty result for mutant 4, retrying 1 more time(s).');
  });

  it('should retry a maximum of 2 times when results are empty and then result in an error result', async () => {
    // Arrange
    const emptyResult = factory.survivedMutantRunResult({ nrOfTests: 0 });
    testRunner1.mutantRun.resolves(emptyResult);
    testRunner2.mutantRun.resolves(emptyResult);
    testRunner3.mutantRun.resolves(emptyResult);
    const runOptions = factory.mutantRunOptions();

    // Act
    const actualResult = await sut.mutantRun(runOptions);

    // Assert
    assertions.expectErrored(actualResult);
    expect(actualResult.errorMessage).eq('Tried 2 test runs, but both failed to run actual tests');
    expect(testRunner3.mutantRun).not.called;
    expect(innerTestRunnerFactoryMethodStub).calledThrice;
  });

  it('should log on debug when result in an error result', async () => {
    // Arrange
    const emptyResult = factory.survivedMutantRunResult({ nrOfTests: 0 });
    testRunner1.mutantRun.resolves(emptyResult);
    testRunner2.mutantRun.resolves(emptyResult);
    testRunner3.mutantRun.resolves(emptyResult);

    // Act
    await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '4' }) }));

    // Assert
    expect(testInjector.logger.debug).calledWithExactly('Detected an empty result for mutant 4 for 2 time(s). Reporting it as a Runtime error.');
  });
});
