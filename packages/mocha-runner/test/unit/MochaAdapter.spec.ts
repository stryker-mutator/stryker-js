import path = require('path');
import fs = require('fs');

import sinon = require('sinon');
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { MochaAdapter } from '../../src/MochaAdapter';
import LibWrapper from '../../src/LibWrapper';

describe(MochaAdapter.name, () => {
  let requireStub: sinon.SinonStub;
  let collectFilesStub: sinon.SinonStub;
  let handleRequiresStub: sinon.SinonStub;
  let loadRootHooks: sinon.SinonStub;
  let sut: MochaAdapter;
  let mochaConstructorStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;

  beforeEach(() => {
    requireStub = sinon.stub(LibWrapper, 'require');
    mochaConstructorStub = sinon.stub(LibWrapper, 'Mocha');
    collectFilesStub = sinon.stub(LibWrapper, 'collectFiles');
    handleRequiresStub = sinon.stub(LibWrapper, 'handleRequires');
    loadRootHooks = sinon.stub(LibWrapper, 'loadRootHooks');
    existsSyncStub = sinon.stub(fs, 'existsSync');
    sut = testInjector.injector.injectClass(MochaAdapter);
  });

  describe(MochaAdapter.prototype.create.name, () => {
    it('should create a new mocha instance with provided options', () => {
      const mochaInstance = { isMochaInstance: true };
      const mochaOptions: Mocha.MochaOptions = { timeout: 2356 };
      mochaConstructorStub.returns(mochaInstance);
      const actual = sut.create(mochaOptions);
      expect(actual).eq(mochaInstance);
      expect(mochaConstructorStub).calledWithNew;
      expect(mochaConstructorStub).calledWithExactly(mochaOptions);
    });
  });

  describe(MochaAdapter.prototype.collectFiles.name, () => {
    let globStub: sinon.SinonStub;

    describe('when mocha version < 6', () => {
      beforeEach(() => {
        collectFilesStub.value(undefined);
        globStub = sinon.stub(LibWrapper, 'glob');
      });

      it('should log about mocha < 6 detection', async () => {
        globStub.returns(['foo.js']);
        sut.collectFiles({});
        expect(testInjector.logger.debug).calledWith('Mocha < 6 detected. Using custom logic to discover files');
      });

      it('should support both `files` as `spec`', async () => {
        globStub.returns(['foo.js']);
        sut.collectFiles({
          files: ['bar'],
          spec: ['foo'],
        });
        expect(globStub).calledWith('foo');
        expect(globStub).calledWith('bar');
      });

      it('should match given file names with configured mocha files as `string`', () => {
        // Arrange
        const relativeGlobPattern = '*.js';
        const expectedFiles = ['foo.js', 'bar.js'];
        globStub.returns(expectedFiles);

        // Act
        const actualFiles = sut.collectFiles({ files: relativeGlobPattern });

        // Assert
        expect(globStub).calledWith(relativeGlobPattern);
        expect(actualFiles).deep.eq(expectedFiles);
      });

      it('should match given file names with default mocha pattern "test/**/*.js"', () => {
        globStub.returns(['foo.js']);
        sut.collectFiles({});
        expect(globStub).calledWith('test/**/*.js');
      });

      it('should reject if no files could be discovered', async () => {
        // Arrange
        globStub.returns([]);
        const relativeGlobbing = JSON.stringify(['test/**/*.js'], null, 2);

        // Act & assert
        expect(() => sut.collectFiles({})).throws(
          `[MochaTestRunner] No files discovered (tried pattern(s) ${relativeGlobbing}). Please specify the files (glob patterns) containing your tests in mochaOptions.spec in your config file.`
        );
        expect(testInjector.logger.debug).calledWith(`Tried ${relativeGlobbing} but did not result in any files.`);
      });
    });

    describe('when mocha version >= 6', () => {
      let discoveredFiles: string[];

      beforeEach(() => {
        discoveredFiles = [];
        collectFilesStub.returns(discoveredFiles);
      });

      it('should log about mocha >= 6 detection', async () => {
        sut.collectFiles({});
        expect(testInjector.logger.debug).calledWith("Mocha >= 6 detected. Using mocha's `collectFiles` to load files");
      });

      it('should mock away the `process.exit` method when calling the mocha function (unfortunate side effect)', async () => {
        const originalProcessExit = process.exit;
        let stubbedProcessExit = process.exit;
        collectFilesStub.callsFake(() => (stubbedProcessExit = process.exit));
        sut.collectFiles({});
        expect(originalProcessExit, "Process.exit doesn't seem to be stubbed away").not.eq(stubbedProcessExit);
        expect(originalProcessExit, "Process.exit doesn't seem to be reset").eq(process.exit);
      });
    });
  });

  describe(MochaAdapter.prototype.handleRequires.name, () => {
    describe('when mocha version < 7.2', () => {
      beforeEach(() => {
        handleRequiresStub.value(undefined);
      });
      it('should pass require additional options when constructed', async () => {
        await sut.handleRequires(['ts-node', 'babel-register']);
        expect(requireStub).calledTwice;
        expect(requireStub).calledWith('ts-node');
        expect(requireStub).calledWith('babel-register');
      });
      it('should resolve local files', async () => {
        const setupFileName = path.resolve('test/setup.js');
        existsSyncStub.returns(false).withArgs(setupFileName).returns(true);
        await sut.handleRequires(['ts-node', 'test/setup.js']);
        expect(requireStub).calledWith('ts-node');
        expect(requireStub).calledWith(setupFileName);
      });
    });

    describe('when mocha version >= 7.2', () => {
      it("should use mocha's `handleRequires`", async () => {
        await sut.handleRequires(['ts-node']);
        expect(handleRequiresStub).calledWithExactly(['ts-node']);
      });

      it('should also load the root hooks', async () => {
        handleRequiresStub.resolves('raw root hooks');
        loadRootHooks.resolves('root hooks');
        const result = await sut.handleRequires(['./test/setup.js']);
        expect(loadRootHooks).calledWith('raw root hooks');
        expect(result).eq('root hooks');
      });
    });
  });
});
