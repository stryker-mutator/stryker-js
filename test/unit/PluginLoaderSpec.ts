import PluginLoader from '../../src/PluginLoader';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import log from '../helpers/log4jsMock';
import * as fs from 'fs';
import * as path from 'path';

describe('PluginLoader', () => {
  let sut: PluginLoader;
  let sandbox: sinon.SinonSandbox;
  let importModuleStub: sinon.SinonStub;
  let pluginDirectoryReadMock: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    importModuleStub = sandbox.stub(fileUtils, 'importModule');
    pluginDirectoryReadMock = sandbox.stub(fs, 'readdirSync');
  });

  describe('without wildcards', () => {
    beforeEach(() => {
      sut = new PluginLoader(['a', 'b']);
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
          expect(log.warn).to.have.been.calledWithMatch(/Cannot find plugin "%s"\./);
          expect(log.warn).to.have.been.calledWithMatch(/Error during loading/);
        });
      });

    });
  });

  describe('with wildcard rolving to "stryker-cli", "stryker-jasmine" and "stryker-karma"', () => {

    beforeEach(() => {
      sut = new PluginLoader(['stryker-*']);
      pluginDirectoryReadMock.returns(['stryker-cli', 'stryker-jasmine', 'stryker-karma']);
    });

    describe('load()', () => {

      beforeEach(() => {
        sut.load();
      });

      it('should read from a `node_modules` folder', () => {
        expect(pluginDirectoryReadMock).to.have.been.calledWith(path.normalize(__dirname + '/../../..'));
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