import sinon from 'sinon';

import { MultiPreprocessor } from '../../../src/sandbox/multi-preprocessor.js';
import { FilePreprocessor } from '../../../src/sandbox/index.js';
import { Project } from '../../../src/fs/project.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

describe(MultiPreprocessor.name, () => {
  describe(MultiPreprocessor.prototype.preprocess.name, () => {
    it('should call preprocess on each preprocessor in order', async () => {
      // Arrange
      const project = new Project(new FileSystemTestDouble({}), {});
      const first = createFilePreprocessorMock();
      const second = createFilePreprocessorMock();
      first.preprocess.resolves();
      second.preprocess.resolves();
      const sut = new MultiPreprocessor([first, second]);

      // Act
      await sut.preprocess(project);

      // Assert
      sinon.assert.calledOnceWithExactly(first.preprocess, project);
      sinon.assert.calledOnceWithExactly(second.preprocess, project);
      sinon.assert.callOrder(first.preprocess, second.preprocess);
    });
  });

  function createFilePreprocessorMock(): sinon.SinonStubbedInstance<FilePreprocessor> {
    return {
      preprocess: sinon.stub(),
    };
  }
});
