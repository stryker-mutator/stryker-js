// it('should configure logging for master', () => {
//   expect(configureMainProcessStub).calledTwice;
// });


// it('should reject when logging server rejects', async () => {
//   const expectedError = Error('expected error');
//   configureLoggingServerStub.rejects(expectedError);
//   await expect(sut.runMutationTest()).rejectedWith(expectedError);
// });

// it('should reject when input file globbing results in a rejection', async () => {
//   const expectedError = Error('expected error');
//   inputFileResolverMock.resolve.rejects(expectedError);
//   await expect(sut.runMutationTest()).rejectedWith(expectedError);
// });


// it('should configure the logging server', async () => {
//   sut = new Stryker({});
//   await sut.runMutationTest();
//   expect(configureLoggingServerStub).calledWith(strykerOptions.logLevel, strykerOptions.fileLogLevel);
// });
