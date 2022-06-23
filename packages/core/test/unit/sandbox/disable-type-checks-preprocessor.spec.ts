import path from 'path';

import type { disableTypeChecks } from '@stryker-mutator/instrumenter';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import { expect } from 'chai';

import { coreTokens } from '../../../src/di/index.js';
import { DisableTypeChecksPreprocessor } from '../../../src/sandbox/disable-type-checks-preprocessor.js';
import { Project } from '../../../src/fs/project.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

describe(DisableTypeChecksPreprocessor.name, () => {
  let sut: DisableTypeChecksPreprocessor;
  let disableTypeCheckingStub: sinon.SinonStubbedMember<typeof disableTypeChecks>;

  beforeEach(() => {
    disableTypeCheckingStub = sinon.stub();
    sut = testInjector.injector.provideValue(coreTokens.disableTypeChecksHelper, disableTypeCheckingStub).injectClass(DisableTypeChecksPreprocessor);
  });

  ['.ts', '.tsx', '.js', '.jsx', '.html', '.vue'].forEach((extension) => {
    it(`should disable type checking a ${extension} file by default`, async () => {
      // Arrange
      const fileName = path.resolve(`src/app${extension}`);
      const project = new Project(new FileSystemTestDouble({ [fileName]: 'input' }), { [fileName]: { mutate: true } });
      disableTypeCheckingStub.resolves({ name: fileName, content: 'output', mutate: true });

      // Act
      await sut.preprocess(project);

      // Assert
      sinon.assert.calledOnceWithExactly(disableTypeCheckingStub, { name: fileName, content: 'input', mutate: true }, { plugins: null });
      expect(await project.files.get(fileName)!.readContent()).eq('output');
    });
  });

  it('should be able to override "disableTypeChecks" glob pattern', async () => {
    // Arrange
    testInjector.options.disableTypeChecks = 'src/**/*.ts';
    const ignoredFileName = path.resolve('test/app.spec.ts');
    const fileName = path.resolve('src/app.ts');
    const project = new Project(new FileSystemTestDouble({ [ignoredFileName]: 'spec', [fileName]: 'input' }), {
      [ignoredFileName]: { mutate: false },
      [fileName]: { mutate: true },
    });
    disableTypeCheckingStub.resolves({ name: fileName, content: 'output', mutate: true });

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(fileName)!.readContent()).eq('output');
    expect(await project.files.get(ignoredFileName)!.readContent()).eq('spec');
  });

  it('should not crash on error, instead log a warning', async () => {
    const fileName = 'src/app.ts';
    const project = new Project(new FileSystemTestDouble({ [fileName]: 'input' }), { [fileName]: { mutate: true } });
    const expectedError = new Error('Expected error for testing');
    disableTypeCheckingStub.rejects(expectedError);
    await sut.preprocess(project);
    expect(testInjector.logger.warn).calledWithExactly(
      'Unable to disable type checking for file "src/app.ts". Shouldn\'t type checking be disabled for this file? Consider configuring a more restrictive "disableTypeChecks" settings (or turn it completely off with `false`)',
      expectedError
    );
    expect(testInjector.logger.warn).calledWithExactly('(disable "warnings.preprocessorErrors" to ignore this warning');
    expect(await project.files.get(fileName)!.readContent()).eq('input');
  });
});
