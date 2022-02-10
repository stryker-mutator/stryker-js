import fs from 'fs';
import { syncBuiltinESMExports } from 'module';
import path from 'path';

import { pathToFileURL } from 'url';

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
    pluginDirectoryReadMock.returns(['util', 'api', 'core', 'typescript-checker', 'karma-runner']);
    sut = testInjector.injector.injectClass(PluginLoader);
  });

  describe(PluginLoader.prototype.load.name, () => {
    it('should import modules with a bare specifier', async () => {
      await sut.load(['a', 'b']);
      expect(fileUtils.importModule).calledWith('a');
      expect(fileUtils.importModule).calledWith('b');
    });

    it('should return the module ids of modules with bare specifier', async () => {
      const result = await sut.load(['a', 'b']);
      expect(result).deep.eq(['a', 'b']);
    });

    it('should load local plugins using their file URLs', async () => {
      const expectedModuleA = pathToFileURL(path.resolve('a')).toString();
      const expectedModuleReporters = pathToFileURL(path.resolve('./reporter.js')).toString();
      const result = await sut.load(['./a', './reporter.js']);
      expect(fileUtils.importModule).calledWith(expectedModuleA);
      expect(fileUtils.importModule).calledWith(expectedModuleReporters);
      expect(result).deep.eq([expectedModuleA, expectedModuleReporters]);
    });

    it('should log MODULE_NOT_FOUND errors as warnings', async () => {
      importModuleStub.throws({ code: 'MODULE_NOT_FOUND', message: 'a' });
      await sut.load(['a', 'b']);
      expect(testInjector.logger.warn).calledWithMatch(/Cannot find plugin "%s"\./);
      expect(testInjector.logger.warn).calledWithMatch(/Error during loading/);
    });

    it('should resolve plugins matching a wildcard from the `node_modules` directory', async () => {
      await sut.load(['@stryker-mutator/*']);
      expect(pluginDirectoryReadMock).calledWith(resolveFromRoot('..', '@stryker-mutator'));
    });

    it('should load plugins matching a wildcard', async () => {
      await sut.load(['@stryker-mutator/*']);
      expect(fileUtils.importModule).calledTwice;
      expect(fileUtils.importModule).calledWithExactly(pathToFileURL(resolveFromRoot('..', '@stryker-mutator', 'typescript-checker')).toString());
      expect(fileUtils.importModule).calledWithExactly(pathToFileURL(resolveFromRoot('..', '@stryker-mutator', 'karma-runner')).toString());
    });
  });
});
