import path from 'path';

import type { execaCommand } from 'execa';
import { npmRunPathEnv } from 'npm-run-path';
import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { I, normalizeWhitespaces } from '@stryker-mutator/util';

import { FileDescriptions } from '@stryker-mutator/api/core';

import { Sandbox } from '../../../src/sandbox/sandbox.js';
import { coreTokens } from '../../../src/di/index.js';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory.js';
import { fileUtils } from '../../../src/utils/file-utils.js';
import { UnexpectedExitHandler } from '../../../src/unexpected-exit-handler.js';
import { Project } from '../../../src/fs/index.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

describe(Sandbox.name, () => {
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let symlinkJunctionStub: sinon.SinonStub;
  let findNodeModulesListStub: sinon.SinonStub;
  let execaCommandMock: sinon.SinonStubbedInstance<I<typeof execaCommand>>;
  let unexpectedExitHandlerMock: sinon.SinonStubbedInstance<I<UnexpectedExitHandler>>;
  let moveDirectoryRecursiveSyncStub: sinon.SinonStub;
  let fsTestDouble: FileSystemTestDouble;
  const SANDBOX_WORKING_DIR = path.resolve('.stryker-tmp/sandbox-123');
  const BACKUP_DIR = 'backup-123';

  beforeEach(() => {
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    temporaryDirectoryMock.getRandomDirectory.withArgs('sandbox').returns(SANDBOX_WORKING_DIR).withArgs('backup').returns(BACKUP_DIR);
    symlinkJunctionStub = sinon.stub(fileUtils, 'symlinkJunction');
    findNodeModulesListStub = sinon.stub(fileUtils, 'findNodeModulesList');
    moveDirectoryRecursiveSyncStub = sinon.stub(fileUtils, 'moveDirectoryRecursiveSync');
    execaCommandMock = sinon.stub();
    unexpectedExitHandlerMock = {
      registerHandler: sinon.stub(),
      dispose: sinon.stub(),
    };
    fsTestDouble = new FileSystemTestDouble(Object.create(null) as Record<string, string>);
    symlinkJunctionStub.resolves();
    findNodeModulesListStub.resolves(['node_modules']);
  });

  function createSut(
    project = new Project(
      fsTestDouble,
      Object.keys(fsTestDouble.files).reduce<FileDescriptions>((fileDescriptions, fileName) => {
        fileDescriptions[fileName] = { mutate: true };
        return fileDescriptions;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      }, Object.create(null)),
    ),
  ): Sandbox {
    return testInjector.injector
      .provideValue(coreTokens.project, project)
      .provideValue(coreTokens.temporaryDirectory, temporaryDirectoryMock)
      .provideValue(coreTokens.execa, execaCommandMock as unknown as typeof execaCommand)
      .provideValue(coreTokens.unexpectedExitRegistry, unexpectedExitHandlerMock)
      .injectClass(Sandbox);
  }

  describe('init()', () => {
    describe('with inPlace = false', () => {
      beforeEach(() => {
        testInjector.options.inPlace = false;
      });

      it('should have created a sandbox folder', async () => {
        const sut = createSut();
        await sut.init();
        expect(temporaryDirectoryMock.getRandomDirectory).calledWith('sandbox');
        expect(temporaryDirectoryMock.createDirectory).calledWith(SANDBOX_WORKING_DIR);
      });

      it('should copy regular input files', async () => {
        fsTestDouble.files[path.resolve('a', 'main.js')] = 'foo("bar")';
        fsTestDouble.files[path.resolve('a', 'b.txt')] = 'b content';
        fsTestDouble.files[path.resolve('c', 'd', 'e.log')] = 'e content';
        const project = new Project(fsTestDouble, {
          [path.resolve('a', 'main.js')]: { mutate: true },
          [path.resolve('a', 'b.txt')]: { mutate: false },
          [path.resolve('c', 'd', 'e.log')]: { mutate: false },
        });
        project.files.get(path.resolve('a', 'main.js'))!.setContent('foo("mutated")');
        const sut = createSut(project);
        await sut.init();

        expect(fsTestDouble.files[path.join(SANDBOX_WORKING_DIR, 'a', 'main.js')]).eq('foo("mutated")');
        expect(fsTestDouble.files[path.join(SANDBOX_WORKING_DIR, 'a', 'b.txt')]).eq('b content');
        expect(fsTestDouble.files[path.join(SANDBOX_WORKING_DIR, 'c', 'd', 'e.log')]).eq('e content');
      });

      it('should be able to copy a local file', async () => {
        fsTestDouble.files['localFile.txt'] = 'foobar';
        const sut = createSut();
        await sut.init();
        expect(fsTestDouble.files[path.join(SANDBOX_WORKING_DIR, 'localFile.txt')]).eq('foobar');
      });

      it('should symlink node modules in sandbox directory if exists', async () => {
        const sut = createSut();
        await sut.init();
        expect(findNodeModulesListStub).calledWith(process.cwd());
        expect(symlinkJunctionStub).calledWith(path.resolve('node_modules'), path.join(SANDBOX_WORKING_DIR, 'node_modules'));
      });
    });

    describe('with inPlace = true', () => {
      beforeEach(() => {
        testInjector.options.inPlace = true;
      });

      it('should have created a backup directory', async () => {
        const sut = createSut();
        await sut.init();
        expect(temporaryDirectoryMock.getRandomDirectory).calledWith('backup');
        expect(temporaryDirectoryMock.createDirectory).calledWith(BACKUP_DIR);
      });

      it('should not override the current file if no changes were detected', async () => {
        fsTestDouble.files[path.resolve('a', 'b.txt')] = 'b content';
        const sut = createSut();
        await sut.init();
        expect(Object.keys(fsTestDouble.files)).lengthOf(1);
      });

      it('should override original file if changes were detected', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        fsTestDouble.files[fileName] = 'b content';
        const project = new Project(fsTestDouble, { [fileName]: { mutate: true } });
        project.files.get(fileName)!.setContent('b mutated content');

        // Act
        const sut = createSut(project);
        await sut.init();

        // Assert
        expect(fsTestDouble.files[fileName]).eq('b mutated content');
      });

      it('should backup the original before overriding it', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        const originalContent = 'b content';
        const mutatedContent = 'b mutated content';
        fsTestDouble.files[fileName] = originalContent;
        const project = new Project(fsTestDouble, { [fileName]: { mutate: true } });
        project.files.get(fileName)!.setContent(mutatedContent);
        const expectedBackupFileName = path.join(path.join(BACKUP_DIR, 'a'), 'b.js');

        // Act
        const sut = createSut(project);
        await sut.init();

        // Assert
        expect(fsTestDouble.files[expectedBackupFileName]).eq(originalContent);
        expect(fsTestDouble.files[fileName]).eq(mutatedContent);
      });

      it('should log the backup file location', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        const originalContent = 'b content';
        const mutatedContent = 'b mutated content';
        fsTestDouble.files[fileName] = originalContent;
        const project = new Project(fsTestDouble, { [fileName]: { mutate: true } });
        project.files.get(fileName)!.setContent(mutatedContent);
        const expectedBackupFileName = path.join(path.join(BACKUP_DIR, 'a'), 'b.js');

        // Act
        const sut = createSut(project);
        await sut.init();

        // Assert
        expect(testInjector.logger.debug).calledWith('Stored backup file at %s', expectedBackupFileName);
      });

      it('should register an unexpected exit handler', async () => {
        // Act
        const sut = createSut();
        await sut.init();

        // Assert
        expect(unexpectedExitHandlerMock.registerHandler).called;
      });
    });

    it('should symlink node modules in sandbox directory if node_modules exist', async () => {
      findNodeModulesListStub.resolves(['node_modules', 'packages/a/node_modules']);
      const sut = createSut();
      await sut.init();

      const calls = symlinkJunctionStub.getCalls();
      expect(calls[0]).calledWithExactly(path.resolve('node_modules'), path.join(SANDBOX_WORKING_DIR, 'node_modules'));
      expect(calls[1]).calledWithExactly(
        path.resolve('packages', 'a', 'node_modules'),
        path.join(SANDBOX_WORKING_DIR, 'packages', 'a', 'node_modules'),
      );
    });

    it('should not symlink node_modules in sandbox directory if no node_modules exist', async () => {
      findNodeModulesListStub.resolves([]);
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.debug).calledWithMatch('Could not find a node_modules');
      expect(testInjector.logger.debug).calledWithMatch(process.cwd());
      expect(symlinkJunctionStub).not.called;
    });

    it('should log a warning if "node_modules" already exists in the working folder', async () => {
      findNodeModulesListStub.resolves(['node_modules']);
      symlinkJunctionStub.rejects(factory.fileAlreadyExistsError());
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.warn).calledWithMatch(
        normalizeWhitespaces(
          `Could not symlink "node_modules" in sandbox directory, it is already created in the sandbox.
        Please remove the node_modules from your sandbox files. Alternatively, set \`symlinkNodeModules\`
        to \`false\` to disable this warning.`,
        ),
      );
    });

    it('should log a warning if linking "node_modules" results in an unknown error', async () => {
      findNodeModulesListStub.resolves(['basePath/node_modules']);
      const error = new Error('unknown');
      symlinkJunctionStub.rejects(error);
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.warn).calledWithMatch(
        normalizeWhitespaces('Unexpected error while trying to symlink "basePath/node_modules" in sandbox directory.'),
        error,
      );
    });

    it('should not symlink node modules in sandbox directory if `symlinkNodeModules` is `false`', async () => {
      testInjector.options.symlinkNodeModules = false;
      const sut = createSut();
      await sut.init();
      expect(symlinkJunctionStub).not.called;
      expect(findNodeModulesListStub).not.called;
    });

    it('should execute the buildCommand in the sandbox', async () => {
      testInjector.options.buildCommand = 'npm run build';
      const sut = createSut();
      await sut.init();
      expect(execaCommandMock).calledWith('npm run build', { cwd: SANDBOX_WORKING_DIR, env: npmRunPathEnv() });
      expect(testInjector.logger.info).calledWith('Running build command "%s" in "%s".', 'npm run build', SANDBOX_WORKING_DIR);
    });

    it('should not execute a build command when non is configured', async () => {
      testInjector.options.buildCommand = undefined;
      const sut = createSut();
      await sut.init();
      expect(execaCommandMock).not.called;
    });

    it('should execute the buildCommand before the node_modules are symlinked', async () => {
      // It is important to first run the buildCommand, otherwise the build dependencies are not correctly resolved
      testInjector.options.buildCommand = 'npm run build';
      const sut = createSut();
      await sut.init();
      expect(execaCommandMock).calledBefore(symlinkJunctionStub);
    });
  });

  describe('dispose', () => {
    it("shouldn't do anything when inPlace = false", () => {
      const sut = createSut();
      sut.dispose();
      expect(moveDirectoryRecursiveSyncStub).not.called;
    });

    it('should recover from the backup dir synchronously if inPlace = true', () => {
      testInjector.options.inPlace = true;
      const sut = createSut();
      sut.dispose();
      expect(moveDirectoryRecursiveSyncStub).calledWith(BACKUP_DIR, process.cwd());
    });

    it('should recover from the backup dir if stryker exits unexpectedly while inPlace = true', () => {
      testInjector.options.inPlace = true;
      const errorStub = sinon.stub(console, 'error');
      createSut();
      unexpectedExitHandlerMock.registerHandler.callArg(0);
      expect(moveDirectoryRecursiveSyncStub).calledWith(BACKUP_DIR, process.cwd());
      expect(errorStub).calledWith(`Detecting unexpected exit, recovering original files from ${BACKUP_DIR}`);
    });
  });

  describe('workingDirectory', () => {
    it('should retrieve the sandbox directory when inPlace = false', async () => {
      const sut = createSut();
      await sut.init();
      expect(sut.workingDirectory).eq(SANDBOX_WORKING_DIR);
    });

    it('should retrieve the cwd directory when inPlace = true', async () => {
      testInjector.options.inPlace = true;
      const sut = createSut();
      await sut.init();
      expect(sut.workingDirectory).eq(process.cwd());
    });
  });

  // describe(Sandbox.prototype.sandboxFileFor.name, () => {
  //   it('should return the sandbox file if exists', async () => {
  //     const originalFileName = path.resolve('src/foo.js');
  //     fsTestDouble.push(new File(originalFileName, ''));
  //     const sut = createSut();
  //     await sut.init();
  //     const actualSandboxFile = sut.sandboxFileFor(originalFileName);
  //     expect(actualSandboxFile).eq(path.join(SANDBOX_WORKING_DIR, 'src/foo.js'));
  //   });

  //   it("should throw when the sandbox file doesn't exists", async () => {
  //     const notExistingFile = 'src/bar.js';
  //     fsTestDouble.push(new File(path.resolve('src/foo.js'), ''));
  //     const sut = createSut();
  //     await sut.init();
  //     expect(() => sut.sandboxFileFor(notExistingFile)).throws('Cannot find sandbox file for src/bar.js');
  //   });
  // });

  describe(Sandbox.prototype.originalFileFor.name, () => {
    it('should remap the file to the original', async () => {
      const sut = createSut();
      await sut.init();
      const sandboxFile = path.join(SANDBOX_WORKING_DIR, 'src/foo.js');
      expect(sut.originalFileFor(sandboxFile)).eq(path.resolve('src/foo.js'));
    });
  });
});
