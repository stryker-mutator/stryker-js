import path = require('path');

import execa = require('execa');
import npmRunPath = require('npm-run-path');
import { expect } from 'chai';
import sinon = require('sinon');
import * as mkdirp from 'mkdirp';

import { testInjector } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';
import { fileAlreadyExistsError } from '@stryker-mutator/test-helpers/src/factory';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { Sandbox } from '../../../src/sandbox/sandbox';
import { coreTokens } from '../../../src/di';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';
import * as fileUtils from '../../../src/utils/fileUtils';

describe(Sandbox.name, () => {
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let files: File[];
  let mkdirpSyncStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let symlinkJunctionStub: sinon.SinonStub;
  let findNodeModulesStub: sinon.SinonStub;
  let execaMock: sinon.SinonStubbedInstance<typeof execa>;
  const SANDBOX_WORKING_DIR = 'sandbox-123';

  beforeEach(() => {
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    temporaryDirectoryMock.createRandomDirectory.returns(SANDBOX_WORKING_DIR);
    mkdirpSyncStub = sinon.stub(mkdirp, 'sync');
    writeFileStub = sinon.stub(fileUtils, 'writeFile');
    symlinkJunctionStub = sinon.stub(fileUtils, 'symlinkJunction');
    findNodeModulesStub = sinon.stub(fileUtils, 'findNodeModules');
    execaMock = {
      command: sinon.stub(),
      commandSync: sinon.stub(),
      node: sinon.stub(),
      sync: sinon.stub(),
    };
    symlinkJunctionStub.resolves();
    findNodeModulesStub.resolves('node_modules');
    files = [];
  });

  function createSut(): Promise<Sandbox> {
    return testInjector.injector
      .provideValue(coreTokens.files, files)
      .provideValue(coreTokens.temporaryDirectory, temporaryDirectoryMock)
      .provideValue(coreTokens.execa, (execaMock as unknown) as typeof execa)
      .injectFunction(Sandbox.create);
  }

  describe('create()', () => {
    it('should have created a sandbox folder', async () => {
      await createSut();
      expect(temporaryDirectoryMock.createRandomDirectory).calledWith('sandbox');
    });

    it('should copy regular input files', async () => {
      const fileB = new File(path.resolve('a', 'b.txt'), 'b content');
      const fileE = new File(path.resolve('c', 'd', 'e.log'), 'e content');
      files.push(fileB);
      files.push(fileE);
      await createSut();
      expect(writeFileStub).calledWith(path.join(SANDBOX_WORKING_DIR, 'a', 'b.txt'), fileB.content);
      expect(writeFileStub).calledWith(path.join(SANDBOX_WORKING_DIR, 'c', 'd', 'e.log'), fileE.content);
    });

    it('should make the dir before copying the file', async () => {
      files.push(new File(path.resolve('a', 'b.js'), 'b content'));
      files.push(new File(path.resolve('c', 'd', 'e.js'), 'e content'));
      await createSut();
      expect(mkdirpSyncStub).calledTwice;
      expect(mkdirpSyncStub).calledWithExactly(path.join(SANDBOX_WORKING_DIR, 'a'));
      expect(mkdirpSyncStub).calledWithExactly(path.join(SANDBOX_WORKING_DIR, 'c', 'd'));
    });

    it('should be able to copy a local file', async () => {
      files.push(new File('localFile.txt', 'foobar'));
      await createSut();
      expect(fileUtils.writeFile).calledWith(path.join(SANDBOX_WORKING_DIR, 'localFile.txt'), Buffer.from('foobar'));
    });

    it('should symlink node modules in sandbox directory if exists', async () => {
      await createSut();
      expect(findNodeModulesStub).calledWith(process.cwd());
      expect(symlinkJunctionStub).calledWith('node_modules', path.join(SANDBOX_WORKING_DIR, 'node_modules'));
    });

    it('should not symlink node modules in sandbox directory if no node_modules exist', async () => {
      findNodeModulesStub.resolves(null);
      await createSut();
      expect(testInjector.logger.warn).calledWithMatch('Could not find a node_modules');
      expect(testInjector.logger.warn).calledWithMatch(process.cwd());
      expect(symlinkJunctionStub).not.called;
    });

    it('should log a warning if "node_modules" already exists in the working folder', async () => {
      findNodeModulesStub.resolves('node_modules');
      symlinkJunctionStub.rejects(fileAlreadyExistsError());
      await createSut();
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
      await createSut();
      expect(testInjector.logger.warn).calledWithMatch(
        normalizeWhitespaces('Unexpected error while trying to symlink "basePath/node_modules" in sandbox directory.'),
        error
      );
    });

    it('should symlink node modules in sandbox directory if `symlinkNodeModules` is `false`', async () => {
      testInjector.options.symlinkNodeModules = false;
      await createSut();
      expect(symlinkJunctionStub).not.called;
      expect(findNodeModulesStub).not.called;
    });

    it('should execute the buildCommand in the sandbox', async () => {
      testInjector.options.buildCommand = 'npm run build';
      await createSut();
      expect(execaMock.command).calledWith('npm run build', { cwd: SANDBOX_WORKING_DIR, env: npmRunPath.env() });
      expect(testInjector.logger.info).calledWith('Running build command "%s" in the sandbox at "%s".', 'npm run build', SANDBOX_WORKING_DIR);
    });

    it('should not execute a build command when non is configured', async () => {
      testInjector.options.buildCommand = undefined;
      await createSut();
      expect(execaMock.command).not.called;
    });

    it('should execute the buildCommand before the node_modules are symlinked', async () => {
      // It is important to first run the buildCommand, otherwise the build dependencies are not correctly resolved
      testInjector.options.buildCommand = 'npm run build';
      await createSut();
      expect(execaMock.command).calledBefore(symlinkJunctionStub);
    });
  });

  describe('get sandboxFileNames()', () => {
    it('should retrieve all files', async () => {
      files.push(new File('a.js', ''));
      files.push(new File(path.resolve('b', 'c', 'e.js'), ''));
      const sut = await createSut();
      expect(sut.sandboxFileNames).deep.eq([path.join(SANDBOX_WORKING_DIR, 'a.js'), path.join(SANDBOX_WORKING_DIR, 'b', 'c', 'e.js')]);
    });
  });
  describe('workingDirectory', () => {
    it('should retrieve the sandbox directory', async () => {
      const sut = await createSut();
      expect(sut.workingDirectory).eq(SANDBOX_WORKING_DIR);
    });
  });
});
