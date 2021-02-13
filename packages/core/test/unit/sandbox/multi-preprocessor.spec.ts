import { File } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import sinon from 'sinon';

import { FilePreprocessor } from '../../../src/sandbox';
import { MultiPreprocessor } from '../../../src/sandbox/multi-preprocessor';

describe(MultiPreprocessor.name, () => {
  describe(MultiPreprocessor.prototype.preprocess.name, () => {
    it('should call preprocess on each preprocessor in order', async () => {
      // Arrange
      const input = [new File('foo.js', 'input')];
      const firstResult = [new File('foo.js', 'first')];
      const secondResult = [new File('foo.js', 'second')];
      const first = createFilePreprocessorMock();
      const second = createFilePreprocessorMock();
      first.preprocess.resolves(firstResult);
      second.preprocess.resolves(secondResult);
      const sut = new MultiPreprocessor([first, second]);

      // Act
      const actual = await sut.preprocess(input);

      // Assert
      expect(actual).eq(secondResult);
      expect(first.preprocess).calledWith(input);
      expect(second.preprocess).calledWith(firstResult);
    });
  });

  function createFilePreprocessorMock(): sinon.SinonStubbedInstance<FilePreprocessor> {
    return {
      preprocess: sinon.stub(),
    };
  }
});
