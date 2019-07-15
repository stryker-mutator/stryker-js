import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as fileUtils from '../../../src/utils/fileUtils';
import { PluginLoader } from '../../../src/di/PluginLoader';
import { fsAsPromised } from '@stryker-mutator/util';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../../src/di';

describe('PluginLoader', () => {

  let sut: PluginLoader;
  let sandbox: sinon.SinonSandbox;
  let importModuleStub: sinon.SinonStub;
  let pluginDirectoryReadMock: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    importModuleStub = sinon.stub(fileUtils, 'importModule');
    pluginDirectoryReadMock = sinon.stub(fsAsPromised, 'readdirSync');
  });

  function createSut(pluginDescriptors: string[]) {
    return TEST_INJECTOR.injector
      .provideValue(coreTokens.PluginDescriptors, pluginDescriptors)
      .injectClass(PluginLoader);
  }

  describe('without wildcards', () => {
    beforeEach(() => {
      sut = createSut(['a', 'b']);
    });

    describe('load()', () => {

      describe('without errors', () => {
        beforeEach(() => {
          sut.load();
        });

        it('should have imported the given modules', () => {
          expect(fileUtils.importModule).to.have.been.calledWith('a');
          expect(fileUtils.importModule).to.have.been.calledWith('b');
        });
      });

      describe('when module could not be found or loaded', () => {
        beforeEach(() => {
          importModuleStub.throws({ code: 'MODULE_NOT_FOUND', message: 'a' });
          sut.load();
        });

        it('should have logged warnings', () => {
          expect(TEST_INJECTOR.logger.warn).to.have.been.calledWithMatch(/Cannot find plugin "%s"\./);
          expect(TEST_INJECTOR.logger.warn).to.have.been.calledWithMatch(/Error during loading/);
        });
      });

    });
  });

  describe('with wildcard resolving to "util", "api", "core", "jasmine-framework" and "karma-runner"', () => {

    beforeEach(() => {
      sut = createSut(['@stryker-mutator/*']);
      pluginDirectoryReadMock.returns(['util', 'api', 'core', 'jasmine-framework', 'karma-runner']);
    });

    describe('load()', () => {

      beforeEach(() => {
        sut.load();
      });

      it('should read from a `node_modules` folder', () => {
        expect(pluginDirectoryReadMock).calledWith(path.resolve(__dirname, '..', '..', '..', '..', '..', '@stryker-mutator'));
      });

      it('should load "@stryker-mutator/jasmine-framework" and "@stryker-mutator/karma-runner"', () => {
        expect(fileUtils.importModule).calledTwice;
        expect(fileUtils.importModule).calledWithMatch(path.resolve(__dirname, '..', '..', '..', '..', '..', '@stryker-mutator', 'jasmine-framework'));
        expect(fileUtils.importModule).calledWithMatch(path.resolve(__dirname, '..', '..', '..', '..', '..', '@stryker-mutator', 'karma-runner'));
      });
    });

  });

  afterEach(() => {
    sandbox.restore();
  });
});
