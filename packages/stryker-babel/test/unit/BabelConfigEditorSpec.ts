import BabelConfigEditor from '../../src/BabelConfigEditor';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as fs from 'fs';
import * as log4js from 'log4js';
import * as sinon from 'sinon';
import * as path from 'path';

describe('BabelConfigEditor', () => {
  let sandbox: sinon.SinonSandbox;
  let logStub: {
    trace: sinon.SinonStub,
    info: sinon.SinonStub,
    error: sinon.SinonStub,
    warn: sinon.SinonStub
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    logStub = {
      trace: sandbox.stub(),
      info: sandbox.stub(),
      error: sandbox.stub(),
      warn: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not read the .babelrc file from disk if the babelConfig property is present', () => {
    const editor = new BabelConfigEditor();
    const babelConfig = { presets: ['env'] };
    const config = new Config();
    config.set({ babelConfig });

    editor.edit(config);

    expect(config.babelConfig).eq(babelConfig);
  });

  describe('babelrcFile property present', () => {
    it('should read the .babelrc file from disk', () => {
      const editor = new BabelConfigEditor();
      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });
      const babelConfig = { presets: ['env'] };
      sandbox.stub(fs, 'existsSync').returns(true);
      sandbox.stub(fs, 'readFileSync').withArgs(path.resolve(config.babelrcFile), 'utf8').returns(JSON.stringify(babelConfig));

      editor.edit(config);

      expect(config.babelConfig).deep.eq(babelConfig);
    });

    it('should log the path to the babelrc file', () => {
      sandbox.stub(log4js, 'getLogger').returns(logStub);
      const editor = new BabelConfigEditor();
      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });

      editor.edit(config);
    });

    describe('when reading the file throws an error', () => {
      it('should log the error', () => {
        sandbox.stub(log4js, 'getLogger').returns(logStub);
        const editor = new BabelConfigEditor();
        const config = new Config();
        config.set({ babelrcFile: '.nonExistingBabelrc' });

        editor.edit(config);

        expect(logStub.error).calledWith(`babelrc file does not exist at: ${path.resolve(config.babelrcFile)}`);
      });

      it('should set the babelConfig to an empty object', () => {
        sandbox.stub(log4js, 'getLogger').returns(logStub);
        const editor = new BabelConfigEditor();
        const config = new Config();
        config.set({ babelrcFile: '.nonExistingBabelrc' });

        editor.edit(config);

        expect(config.babelConfig).to.deep.equal({});
      });
    });
  });

  describe('babelrcFile property is not present', () => {
    it('should log a warning', () => {
      sandbox.stub(log4js, 'getLogger').returns(logStub);
      const editor = new BabelConfigEditor();
      const config = new Config();
      const configKeyFile = 'babelrcFile';

      editor.edit(config);

      expect(logStub.warn).calledWith(`No .babelrc file configured. Please set the "${configKeyFile}" property in your config.`);
    });

    it('should set the babelConfig to an empty object', () => {
      sandbox.stub(log4js, 'getLogger').returns(logStub);
      const editor = new BabelConfigEditor();
      const config = new Config();

      editor.edit(config);

      expect(config.babelConfig).to.deep.equal({});
    });
  });
});
