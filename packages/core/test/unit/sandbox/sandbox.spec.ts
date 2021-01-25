import path = require('path');
import { promises as fsPromises } from 'fs';

import execa = require('execa');
import npmRunPath = require('npm-run-path');
import { expect } from 'chai';
import sinon = require('sinon');
import { testInjector, tick, factory } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';
import { normalizeWhitespaces, Task } from '@stryker-mutator/util';

import { Sandbox } from '../../../src/sandbox/sandbox';
import { coreTokens } from '../../../src/di';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory';
import * as fileUtils from '../../../src/utils/file-utils';
import { UnexpectedExitHandler } from '../../../src/unexpected-exit-handler';

describe(Sandbox.name, () => {
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let files: File[];
  let mkdirpStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let symlinkJunctionStub: sinon.SinonStub;
  let findNodeModulesStub: sinon.SinonStub;
  let execaMock: sinon.SinonStubbedInstance<typeof execa>;
  let unexpectedExitHandlerMock: sinon.SinonStubbedInstance<UnexpectedExitHandler>;
  let readFile: sinon.SinonStub;
  let moveDirectoryRecursiveSyncStub: sinon.SinonStub;
  const SANDBOX_WORKING_DIR = 'sandbox-123';
  const BACKUP_DIR = 'backup-123';

  beforeEach(() => {
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    temporaryDirectoryMock.createRandomDirectory.withArgs('sandbox').returns(SANDBOX_WORKING_DIR).withArgs('backup').returns(BACKUP_DIR);
    mkdirpStub = sinon.stub(fileUtils, 'mkdirp');
    writeFileStub = sinon.stub(fsPromises, 'writeFile');
    symlinkJunctionStub = sinon.stub(fileUtils, 'symlinkJunction');
    findNodeModulesStub = sinon.stub(fileUtils, 'findNodeModules');
    moveDirectoryRecursiveSyncStub = sinon.stub(fileUtils, 'moveDirectoryRecursiveSync');
    readFile = sinon.stub(fsPromises, 'readFile');
    execaMock = {
      command: sinon.stub(),
      commandSync: sinon.stub(),
      node: sinon.stub(),
      sync: sinon.stub(),
    };
    unexpectedExitHandlerMock = {
      registerHandler: sinon.stub(),
      dispose: sinon.stub(),
    };
    symlinkJunctionStub.resolves();
    findNodeModulesStub.resolves('node_modules');
    files = [];
  });

  function createSut(): Sandbox {
    return testInjector.injector
      .provideValue(coreTokens.files, files)
      .provideValue(coreTokens.temporaryDirectory, temporaryDirectoryMock)
      .provideValue(coreTokens.execa, (execaMock as unknown) as typeof execa)
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
        expect(temporaryDirectoryMock.createRandomDirectory).calledWith('sandbox');
      });

      it('should copy regular input files', async () => {
        const fileB = new File(path.resolve('a', 'b.txt'), 'b content');
        const fileE = new File(path.resolve('c', 'd', 'e.log'), 'e content');
        files.push(fileB);
        files.push(fileE);
        const sut = createSut();
        await sut.init();
        expect(writeFileStub).calledWith(path.join(SANDBOX_WORKING_DIR, 'a', 'b.txt'), fileB.content);
        expect(writeFileStub).calledWith(path.join(SANDBOX_WORKING_DIR, 'c', 'd', 'e.log'), fileE.content);
      });

      it('should make the dir before copying the file', async () => {
        files.push(new File(path.resolve('a', 'b.js'), 'b content'));
        files.push(new File(path.resolve('c', 'd', 'e.js'), 'e content'));
        const sut = createSut();
        await sut.init();
        expect(mkdirpStub).calledTwice;
        expect(mkdirpStub).calledWithExactly(path.join(SANDBOX_WORKING_DIR, 'a'));
        expect(mkdirpStub).calledWithExactly(path.join(SANDBOX_WORKING_DIR, 'c', 'd'));
      });

      it('should be able to copy a local file', async () => {
        files.push(new File('localFile.txt', 'foobar'));
        const sut = createSut();
        await sut.init();
        expect(writeFileStub).calledWith(path.join(SANDBOX_WORKING_DIR, 'localFile.txt'), Buffer.from('foobar'));
      });

      it('should symlink node modules in sandbox directory if exists', async () => {
        const sut = createSut();
        await sut.init();
        expect(findNodeModulesStub).calledWith(process.cwd());
        expect(symlinkJunctionStub).calledWith('node_modules', path.join(SANDBOX_WORKING_DIR, 'node_modules'));
      });
    });

    describe('with inPlace = true', () => {
      beforeEach(() => {
        testInjector.options.inPlace = true;
      });

      it('should have created a backup directory', async () => {
        const sut = createSut();
        await sut.init();
        expect(temporaryDirectoryMock.createRandomDirectory).calledWith('backup');
      });

      it('should not override the current file if no changes were detected', async () => {
        const fileB = new File(path.resolve('a', 'b.txt'), 'b content');
        readFile.withArgs(path.resolve('a', 'b.txt')).resolves(Buffer.from('b content'));
        files.push(fileB);
        const sut = createSut();
        await sut.init();
        expect(writeFileStub).not.called;
      });

      it('should override original file if changes were detected', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        const originalContent = Buffer.from('b content');
        const fileB = new File(fileName, 'b mutated content');
        readFile.withArgs(fileName).resolves(originalContent);
        files.push(fileB);

        // Act
        const sut = createSut();
        await sut.init();

        // Assert
        expect(writeFileStub).calledWith(fileB.name, fileB.content);
      });

      it('should override backup the original before overriding it', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        const originalContent = Buffer.from('b content');
        const fileB = new File(fileName, 'b mutated content');
        readFile.withArgs(fileName).resolves(originalContent);
        files.push(fileB);
        const expectedBackupDirectory = path.join(BACKUP_DIR, 'a');
        const expectedBackupFileName = path.join(expectedBackupDirectory, 'b.js');

        // Act
        const sut = createSut();
        await sut.init();

        // Assert
        expect(mkdirpStub).calledWith(expectedBackupDirectory);
        expect(writeFileStub).calledWith(expectedBackupFileName, originalContent);
        expect(writeFileStub.withArgs(expectedBackupFileName)).calledBefore(writeFileStub.withArgs(fileB.name));
      });

      it('should log the backup file location', async () => {
        // Arrange
        const fileName = path.resolve('a', 'b.js');
        const originalContent = Buffer.from('b content');
        const fileB = new File(fileName, 'b mutated content');
        readFile.withArgs(fileName).resolves(originalContent);
        files.push(fileB);
        const expectedBackupFileName = path.join(BACKUP_DIR, 'a', 'b.js');

        // Act
        const sut = createSut();
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

    it('should not open too many file handles', async () => {
      const maxFileIO = 256;
      const fileHandles: Array<{ fileName: string; task: Task }> = [];
      for (let i = 0; i < maxFileIO + 1; i++) {
        const fileName = `file_${i}.js`;
        const task = new Task();
        fileHandles.push({ fileName, task });
        writeFileStub.withArgs(sinon.match(fileName)).returns(task.promise);
        files.push(new File(fileName, ''));
      }

      // Act
      const sut = createSut();
      const initPromise = sut.init();
      await tick();
      expect(writeFileStub).callCount(maxFileIO);
      fileHandles[0].task.resolve();
      await tick();

      // Assert
      expect(writeFileStub).callCount(maxFileIO + 1);
      fileHandles.forEach(({ task }) => task.resolve());
      await initPromise;
    });

    it('should not symlink node modules in sandbox directory if no node_modules exist', async () => {
      findNodeModulesStub.resolves(null);
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.warn).calledWithMatch('Could not find a node_modules');
      expect(testInjector.logger.warn).calledWithMatch(process.cwd());
      expect(symlinkJunctionStub).not.called;
    });

    it('should log a warning if "node_modules" already exists in the working folder', async () => {
      findNodeModulesStub.resolves('node_modules');
      symlinkJunctionStub.rejects(factory.fileAlreadyExistsError());
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.warn).calledWithMatch(
        normalizeWhitespaces(
          `Could not symlink "node_modules" in sandbox directory, it is already created in the sandbox.
        Please remove the node_modules from your sandbox files. Alternatively, set \`symlinkNodeModules\`
        to \`false\` to disable this warning.`
        )
      );
    });

    it('should log a warning if linking "node_modules" results in an unknown error', async () => {
      findNodeModulesStub.resolves('basePath/node_modules');
      const error = new Error('unknown');
      symlinkJunctionStub.rejects(error);
      const sut = createSut();
      await sut.init();
      expect(testInjector.logger.warn).calledWithMatch(
        normalizeWhitespaces('Unexpected error while trying to symlink "basePath/node_modules" in sandbox directory.'),
        error
      );
    });

    it('should symlink node modules in sandbox directory if `symlinkNodeModules` is `false`', async () => {
      testInjector.options.symlinkNodeModules = false;
      const sut = createSut();
      await sut.init();
      expect(symlinkJunctionStub).not.called;
      expect(findNodeModulesStub).not.called;
    });

    it('should execute the buildCommand in the sandbox', async () => {
      testInjector.options.buildCommand = 'npm run build';
      const sut = createSut();
      await sut.init();
      expect(execaMock.command).calledWith('npm run build', { cwd: SANDBOX_WORKING_DIR, env: npmRunPath.env() });
      expect(testInjector.logger.info).calledWith('Running build command "%s" in "%s".', 'npm run build', SANDBOX_WORKING_DIR);
    });

    it('should not execute a build command when non is configured', async () => {
      testInjector.options.buildCommand = undefined;
      const sut = createSut();
      await sut.init();
      expect(execaMock.command).not.called;
    });

    it('should execute the buildCommand before the node_modules are symlinked', async () => {
      // It is important to first run the buildCommand, otherwise the build dependencies are not correctly resolved
      testInjector.options.buildCommand = 'npm run build';
      const sut = createSut();
      await sut.init();
      expect(execaMock.command).calledBefore(symlinkJunctionStub);
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
});
