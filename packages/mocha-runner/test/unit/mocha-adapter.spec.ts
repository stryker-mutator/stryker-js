import path from 'path';
import fs from 'fs';

import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { MochaAdapter } from '../../src/mocha-adapter.js';
import { LibWrapper } from '../../src/lib-wrapper.js';

describe(MochaAdapter.name, () => {
  let requireStub: sinon.SinonStub;
  let collectFilesStub: sinon.SinonStub;
  let handleRequiresStub: sinon.SinonStub;
  let sut: MochaAdapter;
  let mochaConstructorStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;

  beforeEach(() => {
    requireStub = sinon.stub(LibWrapper, 'require');
    mochaConstructorStub = sinon.stub(LibWrapper, 'Mocha');
    collectFilesStub = sinon.stub(LibWrapper, 'collectFiles');
    handleRequiresStub = sinon.stub(LibWrapper, 'handleRequires');
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
    let discoveredFiles: string[];

    beforeEach(() => {
      discoveredFiles = [];
      collectFilesStub.returns(discoveredFiles);
    });

    it('should mock away the `process.exit` method when calling the mocha function (unfortunate side effect)', () => {
      const originalProcessExit = process.exit;
      let stubbedProcessExit = process.exit;
      collectFilesStub.callsFake(() => (stubbedProcessExit = process.exit));
      sut.collectFiles({});
      expect(originalProcessExit, "Process.exit doesn't seem to be stubbed away").not.eq(stubbedProcessExit);
      expect(originalProcessExit, "Process.exit doesn't seem to be reset").eq(process.exit);
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

    describe('when mocha version >= 7.2, < 8.2', () => {
      const originalLoadRootHooks = LibWrapper.loadRootHooks;
      afterEach(() => {
        LibWrapper.loadRootHooks = originalLoadRootHooks;
      });

      it("should use mocha's `handleRequires`", async () => {
        await sut.handleRequires(['ts-node']);
        expect(handleRequiresStub).calledWithExactly(['ts-node']);
      });

      it('should also load the root hooks', async () => {
        const loadRootHooksStub = sinon.stub();
        LibWrapper.loadRootHooks = loadRootHooksStub;
        handleRequiresStub.resolves('raw root hooks');
        loadRootHooksStub.resolves('root hooks');
        const result = await sut.handleRequires(['./test/setup.js']);
        expect(loadRootHooksStub).calledWith('raw root hooks');
        expect(result).eq('root hooks');
      });
    });

    describe('when mocha version >= 8.2', () => {
      const originalLoadRootHooks = LibWrapper.loadRootHooks;
      afterEach(() => {
        LibWrapper.loadRootHooks = originalLoadRootHooks;
      });

      it('should also load the root hooks', async () => {
        delete LibWrapper.loadRootHooks; // this does not exist anymore
        handleRequiresStub.resolves({ rootHooks: 'root hooks' });
        const result = await sut.handleRequires(['./test/setup.js']);
        expect(result).eq('root hooks');
      });
    });
  });
});
