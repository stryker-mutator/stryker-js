import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as fileUtils from '../../../src/utils/fileUtils';
import { PluginLoader } from '../../../src/di/PluginLoader';
import { fsAsPromised } from '@stryker-mutator/util';
import { testInjector } from '@stryker-mutator/test-helpers';
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
    return testInjector.injector
      .provideValue(coreTokens.pluginDescriptors, pluginDescriptors)
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
          expect(testInjector.logger.warn).to.have.been.calledWithMatch(/Cannot find plugin "%s"\./);
          expect(testInjector.logger.warn).to.have.been.calledWithMatch(/Error during loading/);
        });
      });

    });
  });

  describe('with wildcard resolving to "stryker-cli", "stryker-jasmine" and "stryker-karma"', () => {

    beforeEach(() => {
      sut = createSut(['stryker-*']);
      pluginDirectoryReadMock.returns(['stryker-cli', 'stryker-jasmine', 'stryker-karma']);
    });

    describe('load()', () => {

      beforeEach(() => {
        sut.load();
      });

      it('should read from a `node_modules` folder', () => {
        expect(pluginDirectoryReadMock).to.have.been.calledWith(path.resolve(__dirname, '..', '..', '..', '..'));
      });

      it('should load "stryker-jasmine" and "stryker-karma"', () => {
        expect(fileUtils.importModule).to.have.been.calledWithMatch('stryker-jasmine');
        expect(fileUtils.importModule).to.have.been.calledWithMatch('stryker-karma');
        expect(fileUtils.importModule).to.not.have.been.calledWithMatch('stryker-cli');
      });
    });

  });

  afterEach(() => {
    sandbox.restore();
  });
});
