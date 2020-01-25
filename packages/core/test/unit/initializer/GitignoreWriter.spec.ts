import * as os from 'os';

import * as sinon from 'sinon';
import { fsAsPromised } from '@stryker-mutator/util';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { defaultTempDirName } from '@stryker-mutator/api/config';

import GitignoreWriter from '../../../src/initializer/GitignoreWriter';
import { initializerTokens } from '../../../src/initializer';

const GITIGNORE_FILE = '.gitignore';

describe(GitignoreWriter.name, () => {
  let sut: GitignoreWriter;
  let fsAppendFile: sinon.SinonStub;
  let fsExistsSync: sinon.SinonStub;
  let fsReadFile: sinon.SinonStub;
  let out: sinon.SinonStub;

  beforeEach(() => {
    out = sinon.stub();
    fsAppendFile = sinon.stub(fsAsPromised, 'appendFile');
    fsExistsSync = sinon.stub(fsAsPromised, 'existsSync');
    fsReadFile = sinon.stub(fsAsPromised, 'readFile');
    sut = testInjector.injector.provideValue(initializerTokens.out, (out as unknown) as typeof console.log).injectClass(GitignoreWriter);
  });

  describe('addStrykerTempFolder', () => {
    it('should check if the .gitignore file exists', () => {
      // Act
      sut.addStrykerTempFolder();

      // Assert
      expect(fsExistsSync).calledOnceWith(GITIGNORE_FILE);
    });

    describe('with existing .gitignore file', () => {
      beforeEach(() => {
        fsExistsSync.returns(true);
        fsReadFile.returns(Buffer.from('node_modules'));
      });

      it('should append the stryker gitignore configuration', async () => {
        // Act
        await sut.addStrykerTempFolder();

        // Assert
        expect(fsAppendFile).calledWithExactly(GITIGNORE_FILE, `${os.EOL}# stryker temp files${os.EOL}${defaultTempDirName}${os.EOL}`);
      });

      it('should output a message to inform the user that the .gitignore file has been changed', async () => {
        // Arrange
        fsAppendFile.resolves({});

        // Act
        await sut.addStrykerTempFolder();

        // Assert
        expect(out).calledWithExactly('Note: Your .gitignore file has been updated to include recommended git ignore patterns for Stryker');
      });

      it("should not append the stryker gitignore configuration if it's already present", async () => {
        // Arrange
        fsReadFile.returns(`node_modules${os.EOL}${defaultTempDirName}${os.EOL}temp`);

        // Act
        await sut.addStrykerTempFolder();

        // Assert
        expect(fsAppendFile).not.called;
      });
    });

    describe('without a .gitignore file', () => {
      beforeEach(() => {
        fsExistsSync.returns(false);
      });

      it('should output a message to inform the user to change their .gitignore file', () => {
        // Act
        sut.addStrykerTempFolder();

        // Assert
        expect(out).calledWithExactly('No .gitignore file could be found. Please add the following to your .gitignore file: *.stryker-tmp');
      });
    });
  });
});
