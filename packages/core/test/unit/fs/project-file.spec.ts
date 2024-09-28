import path from 'path';

import { MutateDescription } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/instrumenter';
import { expect } from 'chai';
import sinon from 'sinon';

import { FileSystem, ProjectFile } from '../../../src/fs/index.js';
import { createFileSystemMock } from '../../helpers/producers.js';

describe(ProjectFile.name, () => {
  let fileSystemMock: sinon.SinonStubbedInstance<FileSystem>;

  beforeEach(() => {
    fileSystemMock = createFileSystemMock();
  });

  describe(ProjectFile.prototype.readContent.name, () => {
    it('should read the content from disk', async () => {
      const sut = createSut({ name: 'foo.js' });
      fileSystemMock.readFile.resolves('content');
      const result = await sut.readContent();
      expect(result).eq('content');
      sinon.assert.calledOnceWithExactly(fileSystemMock.readFile, 'foo.js', 'utf-8');
    });

    it('should not read the content from disk when the content is set', async () => {
      // Arrange
      const sut = createSut();
      sut.setContent('bar');

      // Act
      const result = await sut.readContent();

      // Assert
      expect(result).eq('bar');
      sinon.assert.notCalled(fileSystemMock.readFile);
    });

    it('should read the content from disk only the first time', async () => {
      // Arrange
      const sut = createSut();
      fileSystemMock.readFile.resolves('content');

      // Act
      await sut.readContent();
      const result = await sut.readContent();

      // Assert
      expect(result).eq('content');
      sinon.assert.calledOnceWithExactly(fileSystemMock.readFile, 'foo.js', 'utf-8');
    });
  });

  describe(ProjectFile.prototype.readOriginal.name, () => {
    it('should read the content from disk', async () => {
      const sut = createSut({ name: 'foo.js' });
      fileSystemMock.readFile.resolves('content');
      const result = await sut.readOriginal();
      expect(result).eq('content');
      sinon.assert.calledOnceWithExactly(fileSystemMock.readFile, 'foo.js', 'utf-8');
    });

    it('should read the content from disk only the first time', async () => {
      // Arrange
      const sut = createSut({ name: 'foo.js' });
      fileSystemMock.readFile.resolves('content');

      // Act
      await sut.readOriginal();
      const result = await sut.readOriginal();

      // Assert
      expect(result).eq('content');
      sinon.assert.calledOnceWithExactly(fileSystemMock.readFile, 'foo.js', 'utf-8');
    });

    it('should also cache original when readContent is called', async () => {
      // Arrange
      const sut = createSut({ name: 'foo.js' });
      fileSystemMock.readFile.resolves('content');

      // Act
      await sut.readContent();
      const result = await sut.readOriginal();

      // Assert
      expect(result).eq('content');
      sinon.assert.calledOnceWithExactly(fileSystemMock.readFile, 'foo.js', 'utf-8');
    });

    it('should still read the content from disk when the content is set in-memory', async () => {
      // Arrange
      const sut = createSut();
      fileSystemMock.readFile.resolves('original');

      // Act
      sut.setContent('bar');
      const result = await sut.readOriginal();

      // Assert
      expect(result).eq('original');
    });
  });

  describe(ProjectFile.prototype.toInstrumenterFile.name, () => {
    it('should read content', async () => {
      // Arrange
      const mutate = [{ start: { column: 1, line: 2 }, end: { column: 3, line: 4 } }];
      const sut = createSut({ name: 'bar.js', mutate });
      fileSystemMock.readFile.resolves('original');

      // Act
      const result = await sut.toInstrumenterFile();

      // Assert
      const expected: File = { content: 'original', mutate, name: 'bar.js' };
      expect(result).deep.eq(expected);
    });
  });

  describe('hasChanges', () => {
    it('should be false when nothing changed', () => {
      const sut = createSut();
      fileSystemMock.readFile.resolves('original');
      expect(sut.hasChanges).false;
    });

    it('should be false when content is read but not overridden', async () => {
      const sut = createSut();
      fileSystemMock.readFile.resolves('original');
      await sut.readOriginal();
      expect(sut.hasChanges).false;
    });

    it('should be false when content is overridden with the same content', async () => {
      const sut = createSut();
      fileSystemMock.readFile.resolves('original');
      await sut.readOriginal();
      sut.setContent('original');
      expect(sut.hasChanges).false;
    });

    it('should be true when content is overridden', () => {
      const sut = createSut();
      sut.setContent('something');
      expect(sut.hasChanges).true;
    });

    it('should be true when content is overridden after read', async () => {
      const sut = createSut();
      fileSystemMock.readFile.resolves('original');
      await sut.readOriginal();
      sut.setContent('');
      expect(sut.hasChanges).true;
    });
  });

  describe(ProjectFile.prototype.writeInPlace.name, () => {
    it('should not do anything when there are no changes', async () => {
      const sut = createSut();
      await sut.writeInPlace();
      sinon.assert.notCalled(fileSystemMock.writeFile);
    });

    it('should override current file when content was overridden', async () => {
      const sut = createSut({ name: 'src/foo.js' });
      sut.setContent('some content');
      await sut.writeInPlace();
      sinon.assert.calledOnceWithExactly(fileSystemMock.writeFile, 'src/foo.js', 'some content', 'utf-8');
    });

    it('should not do anything when the content written had no changes', async () => {
      // Arrange
      const sut = createSut({ name: 'src/foo.js' });
      fileSystemMock.readFile.resolves('original');
      await sut.readContent();
      sut.setContent('original');

      // Act
      await sut.writeInPlace();

      // Assert
      sinon.assert.notCalled(fileSystemMock.writeFile);
    });
  });

  describe(ProjectFile.prototype.writeToSandbox.name, () => {
    it('should write to the sandbox', async () => {
      // Arrange
      const sut = createSut({ name: path.resolve('src', 'foo.js') });
      sut.setContent('foo();');

      // Act
      const actualSandboxFile = await sut.writeToSandbox(path.resolve('.stryker-tmp', 'sandbox123'));

      // Assert
      expect(actualSandboxFile).eq(path.resolve('.stryker-tmp', 'sandbox123', 'src', 'foo.js'));
      sinon.assert.calledOnceWithExactly(fileSystemMock.writeFile, actualSandboxFile, 'foo();', 'utf-8');
      sinon.assert.notCalled(fileSystemMock.copyFile);
    });

    it('should resolve the correct file name when a sandbox outside of the current dir is used', async () => {
      // Arrange
      const sut = createSut({ name: path.resolve('src', 'foo.js') });
      sut.setContent('foo();');

      // Act
      const actualSandboxFile = await sut.writeToSandbox(path.resolve('..', '.stryker-tmp', 'sandbox123'));

      // Assert
      expect(actualSandboxFile).eq(path.resolve('..', '.stryker-tmp', 'sandbox123', 'src', 'foo.js'));
    });

    it('should make the dir before write', async () => {
      // Arrange
      const sut = createSut({ name: path.resolve('src', 'foo.js') });
      sut.setContent('foo();');

      // Act
      const actualSandboxFile = await sut.writeToSandbox(path.resolve('.stryker-tmp', 'sandbox123'));

      // Assert
      sinon.assert.calledOnceWithExactly(fileSystemMock.mkdir, path.dirname(actualSandboxFile), { recursive: true });
      sinon.assert.callOrder(fileSystemMock.mkdir, fileSystemMock.writeFile);
    });

    it('should copy the file instead of reading/writing when the file is not read to memory', async () => {
      // Arrange
      const originalFileName = path.resolve('src', 'foo.js');
      const sut = createSut({ name: originalFileName });

      // Act
      const actualSandboxFile = await sut.writeToSandbox(path.resolve('.stryker-tmp', 'sandbox123'));

      // Assert
      expect(actualSandboxFile).eq(path.resolve('.stryker-tmp', 'sandbox123', 'src', 'foo.js'));
      sinon.assert.calledOnceWithExactly(fileSystemMock.copyFile, originalFileName, actualSandboxFile);
      sinon.assert.notCalled(fileSystemMock.writeFile);
    });
  });

  describe(ProjectFile.prototype.backupTo.name, () => {
    it('should write to the backup', async () => {
      // Arrange
      const sut = createSut({ name: path.resolve('src', 'foo.js') });
      fileSystemMock.readFile.resolves('original');
      await sut.readOriginal();

      // Act
      const actualBackupFile = await sut.backupTo(path.resolve('.stryker-tmp', 'backup123'));

      // Assert
      expect(actualBackupFile).eq(path.resolve('.stryker-tmp', 'backup123', 'src', 'foo.js'));
      sinon.assert.calledOnceWithExactly(fileSystemMock.writeFile, actualBackupFile, 'original');
      sinon.assert.notCalled(fileSystemMock.copyFile);
    });

    it('should make the dir before write', async () => {
      // Arrange
      const sut = createSut({ name: path.resolve('src', 'foo.js') });
      fileSystemMock.readFile.resolves('original');
      await sut.readOriginal();

      // Act
      const actualBackupFile = await sut.backupTo(path.resolve('.stryker-tmp', 'backup123'));

      // Assert
      sinon.assert.calledOnceWithExactly(fileSystemMock.mkdir, path.dirname(actualBackupFile), { recursive: true });
      sinon.assert.callOrder(fileSystemMock.mkdir, fileSystemMock.writeFile);
    });

    it('should copy the file instead of reading/writing when the file is present in memory', async () => {
      // Arrange
      const originalFileName = path.resolve('src', 'foo.js');
      const sut = createSut({ name: originalFileName });

      // Act
      const actualBackupFile = await sut.backupTo(path.resolve('.stryker-tmp', 'backup-123'));

      // Assert
      expect(actualBackupFile).eq(path.resolve('.stryker-tmp', 'backup-123', 'src', 'foo.js'));
      sinon.assert.calledOnceWithExactly(fileSystemMock.copyFile, originalFileName, actualBackupFile);
      sinon.assert.notCalled(fileSystemMock.writeFile);
    });

    it('should ignore in-memory overrides', async () => {
      // Arrange
      const sut = createSut();
      sut.setContent('override!');

      // Act
      await sut.backupTo(path.resolve('.stryker-tmp', 'backup-123'));

      // Assert
      sinon.assert.calledOnce(fileSystemMock.copyFile);
      sinon.assert.notCalled(fileSystemMock.writeFile);
    });
  });

  function createSut(overrides?: Partial<{ name: string; mutate: MutateDescription }>): ProjectFile {
    const { name, mutate } = {
      name: 'foo.js',
      mutate: true,
      ...overrides,
    };
    return new ProjectFile(fileSystemMock, name, mutate);
  }
});
