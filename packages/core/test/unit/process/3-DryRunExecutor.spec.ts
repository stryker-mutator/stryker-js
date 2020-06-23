// it('should reject when initial test run rejects', async () => {
//   const expectedError = Error('expected error');
//   initialTestExecutorMock.run.rejects(expectedError);
//   await expect(sut.runMutationTest()).rejectedWith(expectedError);
// });

// it('should calculate the overhead time milliseconds', async () => {
//   // Arrange
//   const expectedOverHeadTimeMs = 82;
//   expectedRunResult.tests[0].timeSpentMs = 10;
//   expectedRunResult.tests.push(testResult({ timeSpentMs: 2 }));
//   expectedRunResult.tests.push(testResult({ timeSpentMs: 6 }));
//   timerMock.elapsedMs.returns(100);
//   sut = createSut();

//   // Act
//   const { overheadTimeMS } = await sut.run();

//   // Assert
//   expect(timerMock.mark).calledWith('Initial test run');
//   expect(timerMock.elapsedMs).calledWith('Initial test run');
//   expect(timerMock.mark).calledBefore(timerMock.elapsedMs);
//   expect(overheadTimeMS).eq(expectedOverHeadTimeMs);
// });

// it('should never calculate a negative overhead time', async () => {
//   expectedRunResult.tests[0].timeSpentMs = 10;
//   timerMock.elapsedMs.returns(9);
//   sut = createSut();
//   const { overheadTimeMS } = await sut.run();
//   expect(overheadTimeMS).eq(0);
// });

// it('should pass through the result', async () => {
//   const coverageData = coverageMaps();
//   coverageInstrumenterTranspilerMock.fileCoverageMaps = { someFile: coverageData } as any;
//   timerMock.elapsedMs.returns(42);
//   const expectedResult: InitialTestRunResult = {
//     coverageMaps: {
//       someFile: coverageData,
//     },
//     overheadTimeMS: 42 - expectedRunResult.tests[0].timeSpentMs,
//     runResult: expectedRunResult,
//     sourceMapper: sourceMapperMock,
//   };
//   sut = createSut();
//   const actualRunResult = await sut.run();
//   expect(actualRunResult).deep.eq(expectedResult);
// });

// it('should have logged the amount of tests ran', async () => {
//   expectedRunResult.tests.push(testResult());
//   timerMock.humanReadableElapsed.returns('2 seconds');
//   timerMock.elapsedMs.returns(50);
//   sut = createSut();
//   await sut.run();
//   expect(testInjector.logger.info).to.have.been.calledWith(
//     'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
//     2,
//     '2 seconds',
//     20,
//     30
//   );
// });

// it('should log when there were no tests', async () => {
//   while (expectedRunResult.tests.pop());
//   sut = createSut();
//   await sut.run();
//   expect(testInjector.logger.warn).to.have.been.calledWith(
//     'No tests were executed. Stryker will exit prematurely. Please check your configuration.'
//   );
// });

// it('should pass through any rejections', async () => {
//   const expectedError = new Error('expected error');
//   strykerSandboxMock.run.rejects(expectedError);
//   sut = createSut();
//   await expect(sut.run()).rejectedWith(expectedError);
// });

// it('should quit early if no tests were executed in initial test run', async () => {
//   while (initialRunResult.tests.pop());
//   const actualResults = await sut.runMutationTest();
//   expect(mutationTestExecutorMock.run).not.called;
//   expect(actualResults).lengthOf(0);
// });

// it('should quit early if no mutants were generated', async () => {
//   while (mutants.pop()); // clear all mutants
//   await sut.runMutationTest();
//   expect(mutationTestExecutorMock.run).not.called;
// });

// it('should log the remark to run again with logLevel trace if no tests were executed in initial test run', async () => {
//   while (initialRunResult.tests.pop());
//   await sut.runMutationTest();
//   expect(logMock.info).to.have.been.calledWith(
//     'Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.'
//   );
// });
