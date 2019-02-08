import BabelConfigReader from '../../src/BabelConfigReader';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as path from 'path';
import { testInjector } from '@stryker-mutator/test-helpers';

describe('BabelConfigReader', () => {
  let sandbox: sinon.SinonSandbox;
  let sut: BabelConfigReader;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sut = testInjector.injector.injectClass(BabelConfigReader);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not read the .babelrc file from disk if the babelConfig property is present', () => {
    const babelConfig = { presets: ['env'] };
    const config = new Config();
    config.set({ babelConfig });

    const result = sut.readConfig(config);

    expect(result).eq(babelConfig);
  });

  describe('babelrcFile property present', () => {
    it('should read the .babelrc file from disk', () => {
      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });
      const babelConfig = { presets: ['env'] };
      sandbox.stub(fs, 'existsSync').returns(true);
      sandbox.stub(fs, 'readFileSync').withArgs(path.resolve(config.babelrcFile), 'utf8').returns(JSON.stringify(babelConfig));

      const result = sut.readConfig(config);

      expect(result).deep.eq(babelConfig);
    });

    it('should log the path to the babelrc file', () => {

      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });

      sut.readConfig(config);

      expect(testInjector.logger.info).calledWith(`Reading .babelrc file from path "${path.resolve(config.babelrcFile)}"`);
    });

    it('should log the babel config if read from an babelrc file', () => {
      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });
      sandbox.stub(fs, 'readFileSync').returns('{ "presets": ["env"] }');
      sandbox.stub(fs, 'existsSync').returns(true);
      sut.readConfig(config);

      expect(testInjector.logger.debug).calledWith(`babel config is: ${JSON.stringify({ presets: ['env']}, null, 2)}`);
    });

    describe('when reading the file throws an error', () => {
      it('should log the error', () => {
        const config = new Config();
        config.set({ babelrcFile: '.nonExistingBabelrc' });

        sut.readConfig(config);

        expect(testInjector.logger.error).calledWith(`babelrc file does not exist at: ${path.resolve(config.babelrcFile)}`);
      });

      it('should set the babelConfig to an empty object', () => {
        const config = new Config();
        config.set({ babelrcFile: '.nonExistingBabelrc' });

        const result = sut.readConfig(config);

        expect(result).to.deep.equal({});
      });
    });
  });

  describe('babelrcFile property is not present', () => {
    it('should log a warning', () => {
      const config = new Config();
      const configKeyFile = 'babelrcFile';

      sut.readConfig(config);

      expect(testInjector.logger.info).calledWith(`No .babelrc file configured. Please set the "${configKeyFile}" property in your config.`);
    });

    it('should set the babelConfig to an empty object', () => {
      const config = new Config();

      const result = sut.readConfig(config);

      expect(result).to.deep.equal({});
    });
  });
});
