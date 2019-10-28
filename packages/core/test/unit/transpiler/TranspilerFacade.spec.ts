import { File } from '@stryker-mutator/api/core';
import { PluginKind } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/PluginCreator';
import { TranspilerFacade } from '../../../src/transpiler/TranspilerFacade';
import { mock, Mock } from '../../helpers/producers';

describe(TranspilerFacade.name, () => {
  let sut: TranspilerFacade;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.Transpiler>>;

  describe('when there are no transpilers', () => {
    beforeEach(() => {
      pluginCreatorMock = sinon.createStubInstance(PluginCreator);
      sut = createSut();
    });

    it('should return input when `transpile` is called', async () => {
      const input = [new File('input', '')];
      const outputFiles = await sut.transpile(input);
      expect(pluginCreatorMock.create).not.called;
      expect(outputFiles).eq(input);
    });
  });

  describe('with 2 transpilers', () => {
    let transpilerOne: Mock<Transpiler>;
    let transpilerTwo: Mock<Transpiler>;
    let resultFilesOne: readonly File[];
    let resultFilesTwo: readonly File[];
    beforeEach(() => {
      testInjector.options.transpilers = ['transpiler-one', 'transpiler-two'];
      transpilerOne = mock(TranspilerFacade);
      transpilerTwo = mock(TranspilerFacade);
      resultFilesOne = [new File('result-1', '')];
      resultFilesTwo = [new File('result-2', '')];
      pluginCreatorMock = sinon.createStubInstance(PluginCreator);
      pluginCreatorMock.create
        .withArgs('transpiler-one')
        .returns(transpilerOne)
        .withArgs('transpiler-two')
        .returns(transpilerTwo);
      transpilerOne.transpile.resolves(resultFilesOne);
      transpilerTwo.transpile.resolves(resultFilesTwo);
      sut = createSut();
    });

    it('should create two transpilers', () => {
      expect(pluginCreatorMock.create).calledTwice;
      expect(pluginCreatorMock.create).calledWith('transpiler-one');
      expect(pluginCreatorMock.create).calledWith('transpiler-two');
    });

    it('should chain the transpilers when `transpile` is called', async () => {
      const input = [new File('input', '')];
      const outputFiles = await sut.transpile(input);
      expect(outputFiles).eq(resultFilesTwo);
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).calledWith(resultFilesOne);
    });

    it('should stop chaining if an error occurs during `transpile`', async () => {
      // Arrange
      transpilerOne.transpile.reset();
      const expectedError = new Error('an error');
      transpilerOne.transpile.rejects(expectedError);
      const input = [new File('input', '')];

      // Act
      const transpilePromise = sut.transpile(input);

      // Assert
      await expect(transpilePromise).rejectedWith('An error occurred in transpiler "transpiler-one". Inner error: Error: an error');

      // Assert
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).not.called;
    });
  });
  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.pluginCreatorTranspiler, (pluginCreatorMock as unknown) as PluginCreator<PluginKind.Transpiler>)
      .injectClass(TranspilerFacade);
  }
});
