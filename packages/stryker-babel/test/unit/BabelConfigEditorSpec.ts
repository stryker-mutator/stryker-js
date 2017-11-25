import BabelConfigEditor from '../../src/BabelConfigEditor';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as path from 'path';

describe('BabelConfigEditor', () => {
  let sandbox: sinon.SinonSandbox;
  let fsStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    fsStub = sandbox.stub(fs, 'readFileSync');
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
      const babelConfig = { presets: ['env'] };
      const config = new Config();
      config.set({ babelrcFile: '.babelrc' });
      fsStub.withArgs(path.resolve(config.babelrcFile), 'utf8').returns(JSON.stringify(babelConfig));

      editor.edit(config);

      expect(config.babelConfig).deep.eq(babelConfig);
    });

    it('should log the path to the babelrc file', () => {
      expect.fail();
    });

    describe('when reading the file throws an error',() => {
      it('should log the error', () => {
        expect.fail();
      });

      it('should set the babelConfig to an empty object', () => {
        expect.fail();
      });
    });
  });

  describe('babelrcFile property is not present',() => {
    it('should log a warning', () => {
      expect.fail();
    });

    it('should set the babelConfig to an empty object', () => {
      expect.fail();
    });
  });
});