import fs from 'fs';
import { syncBuiltinESMExports } from 'module';
import path from 'path';

import { expect } from 'chai';
import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

import { PluginLoader } from '../../../src/di/index.js';
import { fileUtils } from '../../../src/utils/file-utils.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

describe(PluginLoader.name, () => {
  let sut: PluginLoader;
  let importModuleStub: sinon.SinonStub;
  let resolve: sinon.SinonStubbedMember<typeof resolveFromRoot>;
  let pluginDirectoryReadMock: sinon.SinonStub;

  beforeEach(() => {
    importModuleStub = sinon.stub(fileUtils, 'importModule');
    pluginDirectoryReadMock = sinon.stub(fs, 'readdirSync');
    resolve = sinon.stub();
    resolve.callsFake((id) => path.resolve(id));
    syncBuiltinESMExports();
    sut = testInjector.injector.injectClass(PluginLoader);
  });

  describe('without wildcards', () => {
    it('should have imported the given modules', async () => {
      await sut.load(['a', 'b']);
      expect(fileUtils.importModule).calledWith('a');
      expect(fileUtils.importModule).calledWith('b');
    });

    it('should return the module ids', async () => {
      const result = await sut.load(['a', 'b']);
      expect(result).deep.eq(['a', 'b']);
    });

    it('should return resolve local plugins', async () => {
      const result = await sut.load(['./a', './reporter.js']);
      expect(fileUtils.importModule).calledWith(path.resolve('a'));
      expect(fileUtils.importModule).calledWith(path.resolve('./reporter.js'));
      expect(result).deep.eq([path.resolve('a'), path.resolve('./reporter.js')]);
    });

    it('should log MODULE_NOT_FOUND errors as warnings', async () => {
      importModuleStub.throws({ code: 'MODULE_NOT_FOUND', message: 'a' });
      await sut.load(['a', 'b']);
      expect(testInjector.logger.warn).calledWithMatch(/Cannot find plugin "%s"\./);
      expect(testInjector.logger.warn).calledWithMatch(/Error during loading/);
    });
  });

  describe('with a wildcard', () => {
    beforeEach(() => {
      pluginDirectoryReadMock.returns(['util', 'api', 'core', 'typescript-checker', 'karma-runner']);
    });

    describe('load()', () => {
      it('should read from a `node_modules` folder', async () => {
        await sut.load(['@stryker-mutator/*']);
        expect(pluginDirectoryReadMock).calledWith(resolveFromRoot('..', '@stryker-mutator'));
      });

      it('should load matching modules', async () => {
        await sut.load(['@stryker-mutator/*']);
        expect(fileUtils.importModule).calledTwice;
        expect(fileUtils.importModule).calledWithExactly(resolveFromRoot('..', '@stryker-mutator', 'typescript-checker'));
        expect(fileUtils.importModule).calledWithExactly(resolveFromRoot('..', '@stryker-mutator', 'karma-runner'));
      });
    });
  });
});
