import { Stats } from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { FileSystem, ProjectFile } from '../../../src/fs/index.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

import { CleanupFileSystem } from './cleanup-file-system.js';

const resolveTestResource = resolveFromRoot.bind(undefined, 'testResources', 'project-file');
const TARGET_DIRECTORY = 'temp';

describe(`${ProjectFile.name} integration`, function () {
  let sut: ProjectFile;
  let fileSystem: FileSystem;
  let cleanupFileSystem: CleanupFileSystem;
  let originalCwd: string;
  const isRunningWindows = process.platform === 'win32';

  beforeEach(() => {
    originalCwd = process.cwd();
    fileSystem = testInjector.injector.injectClass(FileSystem);
    cleanupFileSystem = testInjector.injector.injectClass(CleanupFileSystem);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (isRunningWindows) {
      return;
    }
    fileSystem.dispose();
    cleanupFileSystem.dispose();
  });

  it('should copy file permissions when moving to sandbox', async function () {
    if (isRunningWindows) {
      console.log('SKIP. Test uses chmod and related, which does not work on windows');
      this.skip();
    }
    // Arrange
    process.chdir(resolveTestResource());
    const originalFile = await prepareFullRightsFile(fileSystem);
    sut = new ProjectFile(fileSystem, originalFile, false);

    // Act
    const sandboxDestination = await sut.writeToSandbox(resolveTestResource(TARGET_DIRECTORY));

    // Assert
    expect(sandboxDestination).eq(resolveTestResource(TARGET_DIRECTORY, 'full-rights-file.txt'));
    const newFileStats = await fileSystem.stat(sandboxDestination);
    expect(statToChmod(newFileStats)).eq('0777');
    await cleanupFileSystem.rm(sandboxDestination);
  });

  it('should copy file permissions when moving to sandbox with original content', async function () {
    if (isRunningWindows) {
      console.log('SKIP. Test uses chmod and related, which does not work on windows');
      this.skip();
    }
    // Arrange
    process.chdir(resolveTestResource());
    const originalFile = await prepareFullRightsFile(fileSystem);
    sut = new ProjectFile(fileSystem, originalFile, false);
    await sut.readOriginal();

    // Act
    const sandboxDestination = await sut.writeToSandbox(resolveTestResource(TARGET_DIRECTORY));

    // Assert
    expect(sandboxDestination).eq(resolveTestResource(TARGET_DIRECTORY, 'full-rights-file.txt'));
    const newFileStats = await fileSystem.stat(sandboxDestination);
    expect(statToChmod(newFileStats)).eq('0777');
    await cleanupFileSystem.rm(sandboxDestination);
  });

  it('should copy file permissions when moving to backup', async function () {
    if (isRunningWindows) {
      console.log('SKIP. Test uses chmod and related, which does not work on windows');
      this.skip();
    }
    // Arrange
    process.chdir(resolveTestResource());
    const originalFile = await prepareFullRightsFile(fileSystem);
    sut = new ProjectFile(fileSystem, originalFile, false);

    // Act
    const backupDestination = await sut.backupTo(resolveTestResource(TARGET_DIRECTORY));

    // Assert
    expect(backupDestination).eq(resolveTestResource(TARGET_DIRECTORY, 'full-rights-file.txt'));
    const newFileStats = await fileSystem.stat(backupDestination);
    expect(statToChmod(newFileStats)).eq('0777');
    await cleanupFileSystem.rm(backupDestination);
  });

  it('should copy file permissions when moving to backup with original content', async function () {
    if (isRunningWindows) {
      console.log('SKIP. Test uses chmod and related, which does not work on windows');
      this.skip();
    }
    // Arrange
    process.chdir(resolveTestResource());
    const originalFile = await prepareFullRightsFile(fileSystem);
    sut = new ProjectFile(fileSystem, originalFile, false);
    await sut.readOriginal();

    // Act
    const backupDestination = await sut.backupTo(resolveTestResource(TARGET_DIRECTORY));

    // Assert
    expect(backupDestination).eq(resolveTestResource(TARGET_DIRECTORY, 'full-rights-file.txt'));
    const newFileStats = await fileSystem.stat(backupDestination);
    expect(statToChmod(newFileStats)).eq('0777');
    await cleanupFileSystem.rm(backupDestination);
  });
});

async function prepareFullRightsFile(fileSystem: FileSystem) {
  const originalFile = resolveTestResource('full-rights-file.txt');
  await fileSystem.chmod(originalFile, '0777');

  const originFileStats = await fileSystem.stat(originalFile);
  expect(statToChmod(originFileStats)).eq('0777');
  return originalFile;
}

function statToChmod(stats: Stats): string {
  const unixFilePermissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
  return unixFilePermissions;
}
