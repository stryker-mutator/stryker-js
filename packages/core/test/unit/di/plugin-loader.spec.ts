import fs from 'fs';
import { fileURLToPath, URL } from 'url';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { PluginLoader } from '../../../src/di/index.js';
import { fileUtils } from '../../../src/utils/file-utils.js';

describe('PluginLoader', () => {
  let sut: PluginLoader;
  let importModuleStub: sinon.SinonStub;
  let pluginDirectoryReadMock: sinon.SinonStub;

  beforeEach(() => {
    importModuleStub = sinon.stub(fileUtils, 'importModule');
    pluginDirectoryReadMock = sinon.stub(fs, 'readdirSync');
    sut = testInjector.injector.injectClass(PluginLoader);
  });

  describe('without wildcards', () => {
    it('should have imported the given modules', async () => {
      await sut.load(['a', 'b']);
      expect(fileUtils.importModule).calledWith('a');
      expect(fileUtils.importModule).calledWith('b');
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
        expect(pluginDirectoryReadMock).calledWith(fileURLToPath(new URL('../../../../../../@stryker-mutator', import.meta.url)));
      });

      it('should load matching modules', async () => {
        await sut.load(['@stryker-mutator/*']);
        expect(fileUtils.importModule).calledTwice;
        expect(fileUtils.importModule).calledWithMatch(
          fileURLToPath(new URL('../../../../../../@stryker-mutator/typescript-checker', import.meta.url))
        );
        expect(fileUtils.importModule).calledWithMatch(fileURLToPath(new URL('../../../../../../@stryker-mutator/karma-runner', import.meta.url)));
      });
    });
  });
});
