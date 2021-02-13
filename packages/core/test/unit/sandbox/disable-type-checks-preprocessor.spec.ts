import path from 'path';

import { File } from '@stryker-mutator/api/core';
import { assertions, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import { DisableTypeChecksPreprocessor } from '../../../src/sandbox/disable-type-checks-preprocessor';

describe(DisableTypeChecksPreprocessor.name, () => {
  let sut: DisableTypeChecksPreprocessor;
  let disableTypeCheckingStub: sinon.SinonStub;

  beforeEach(() => {
    disableTypeCheckingStub = sinon.stub();
    sut = testInjector.injector.provideValue(coreTokens.disableTypeChecksHelper, disableTypeCheckingStub).injectClass(DisableTypeChecksPreprocessor);
  });

  ['.ts', '.tsx', '.js', '.jsx', '.html', '.vue'].forEach((extension) => {
    it(`should disable type checking a ${extension} file by default`, async () => {
      const fileName = `src/app${extension}`;
      const expectedFile = new File(path.resolve(fileName), 'output');
      const inputFile = new File(path.resolve(fileName), 'input');
      const input = [inputFile];
      disableTypeCheckingStub.resolves(expectedFile);
      const output = await sut.preprocess(input);
      expect(disableTypeCheckingStub).calledWith(inputFile);
      assertions.expectTextFilesEqual(output, [expectedFile]);
    });
  });

  it('should be able to override "disableTypeChecks" glob pattern', async () => {
    testInjector.options.disableTypeChecks = 'src/**/*.ts';
    const expectedFile = new File(path.resolve('src/app.ts'), 'output');
    const input = [new File(path.resolve('src/app.ts'), 'input')];
    disableTypeCheckingStub.resolves(expectedFile);
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, [expectedFile]);
  });

  it('should not disable type checking when the "disableTypeChecks" glob pattern does not match', async () => {
    testInjector.options.disableTypeChecks = 'src/**/*.ts';
    const expectedFiles = [new File(path.resolve('test/app.spec.ts'), 'input')];
    disableTypeCheckingStub.resolves(new File('', 'not expected'));
    const output = await sut.preprocess(expectedFiles);
    assertions.expectTextFilesEqual(output, expectedFiles);
  });

  it('should not disable type checking if "disableTypeChecks" is set to `false`', async () => {
    const input = [
      new File(path.resolve('src/app.ts'), '// @ts-expect-error\nfoo.bar();'),
      new File(path.resolve('test/app.spec.ts'), '/* @ts-expect-error */\nfoo.bar();'),
      new File(path.resolve('testResources/project/app.ts'), '/* @ts-expect-error */\nfoo.bar();'),
    ];
    testInjector.options.disableTypeChecks = false;
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, input);
  });

  it('should not crash on error, instead log a warning', async () => {
    const input = [new File('src/app.ts', 'input')];
    const expectedError = new Error('Expected error for testing');
    disableTypeCheckingStub.rejects(expectedError);
    const output = await sut.preprocess(input);
    expect(testInjector.logger.warn).calledWithExactly(
      'Unable to disable type checking for file "src/app.ts". Shouldn\'t type checking be disabled for this file? Consider configuring a more restrictive "disableTypeChecks" settings (or turn it completely off with `false`)',
      expectedError
    );
    expect(testInjector.logger.warn).calledWithExactly('(disable "warnings.preprocessorErrors" to ignore this warning');
    assertions.expectTextFilesEqual(output, input);
  });
});
