import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import TranspilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Transpiler } from 'stryker-api/transpile';
import { mock, Mock } from '../../helpers/producers';
import { File } from 'stryker-api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as sinon from 'sinon';

describe('TranspilerFacade', () => {
  let sut: TranspilerFacade;

  describe('when there are no transpilers', () => {

    beforeEach(() => {
      const sut = testInjector.injector.injectClass(TranspilerFacade);
    });

    it('should return input when `transpile` is called', async () => {
      const input = [new File('input', '')];
      const outputFiles = await sut.transpile(input);
      expect(createStub).not.called;
      expect(outputFiles).eq(input);
    });
  });

  describe('with 2 transpilers', () => {

    let transpilerOne: Mock<Transpiler>;
    let transpilerTwo: Mock<Transpiler>;
    let resultFilesOne: ReadonlyArray<File>;
    let resultFilesTwo: ReadonlyArray<File>;
    let config: Config;

    beforeEach(() => {
      config = new Config();
      config.transpilers.push('transpiler-one', 'transpiler-two');
      transpilerOne = mock(TranspilerFacade);
      transpilerTwo = mock(TranspilerFacade);
      resultFilesOne = [new File('result-1', '')];
      resultFilesTwo = [new File('result-2', '')];
      createStub
        .withArgs('transpiler-one').returns(transpilerOne)
        .withArgs('transpiler-two').returns(transpilerTwo);
      transpilerOne.transpile.resolves(resultFilesOne);
      transpilerTwo.transpile.resolves(resultFilesTwo);
    });

    it('should create two transpilers', () => {
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
      expect(createStub).calledTwice;
      expect(createStub).calledWith('transpiler-one');
      expect(createStub).calledWith('transpiler-two');
    });

    it('should chain the transpilers when `transpile` is called', async () => {
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
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
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
      const input = [new File('input', '')];

      // Act
      const transpilePromise = sut.transpile(input);

      // Assert
      await (expect(transpilePromise).rejectedWith('An error occurred in transpiler "transpiler-one". Inner error: Error: an error'));

      // Assert
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).not.called;
    });

  });
});
