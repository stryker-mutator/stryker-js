import * as sinon from 'sinon';
import { expect } from 'chai';
import * as karmaConfigReaderModule from '../../src/KarmaConfigReader';
import KarmaConfigEditor from '../../src/KarmaConfigEditor';
import { Config } from 'stryker-api/config';

describe('KarmaConfigEditor', () => {
  let sut: KarmaConfigEditor;
  let sandbox: sinon.SinonSandbox;
  let karmaConfigReader: { read: sinon.SinonStub };
  let config: Config;

  beforeEach(() => {
    sut = new KarmaConfigEditor();
    sandbox = sinon.sandbox.create();
    karmaConfigReader = { read: sandbox.stub() };
    sandbox.stub(karmaConfigReaderModule, 'default').returns(karmaConfigReader);
    config = new Config();
    config['karmaConfigFile'] = 'expectedFile';
  });

  afterEach(() => sandbox.restore());

  describe('write', () => {

    it('should create karmaConfigReader using "karmaConfigFile"', () => {
      sut.edit(config);
      expect(karmaConfigReaderModule.default).to.have.been.calledWith('expectedFile');
      expect(karmaConfigReaderModule.default).to.have.been.calledWithNew;
    });

    describe('without readable config', () => {

      it('should not override the runner', () => {
        sut.edit(config);
        expect(config.testRunner).to.be.undefined;
      });
    });

    describe('with readable config', () => {
      let karmaConfig: any;

      beforeEach(() => {
        karmaConfig = {};
        karmaConfigReader.read.returns(karmaConfig);
      });

      it('should not override the runner if it was not provided already, as it could result in strange behavior', () => {
        sut.edit(config);
        expect(config.testRunner).to.be.undefined;
      });

      it('should not override the runner if it was provided already', () => {
        config.testRunner = 'harry';
        sut.edit(config);
        expect(config.testRunner).to.be.eq('harry');
      });

      it('should import files', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }];
        sut.edit(config);
        expect(config.files).to.be.deep.eq([{ pattern: 'somePattern', mutated: false, included: false }]);
      });

      it('should not completely override files, but instead unshift files to the top of the array', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }, { pattern: 'secondPattern' }];
        config.files = ['someFile'];
        sut.edit(config);
        expect(config.files).to.be.deep.eq(
          [
            { pattern: 'somePattern', mutated: false, included: false },
            { pattern: 'secondPattern', mutated: false, included: false },
            'someFile'
          ]);
      });

      it('should exclude the excluded files', () => {
        karmaConfig.exclude = ['someFile'];
        sut.edit(config);
        expect(config.files).to.be.deep.eq(['!someFile']);
      });

      it('should exclude the excluded files before the `files` already defined in stryker', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }, { pattern: 'secondPattern' }];
        karmaConfig.exclude = ['excludedFile'];
        config.files = ['file/from/stryker/config.js'];
        sut.edit(config);
        expect(config.files).to.be.deep.eq(
          [
            { pattern: 'somePattern', mutated: false, included: false },
            { pattern: 'secondPattern', mutated: false, included: false },
            '!excludedFile',
            'file/from/stryker/config.js'
          ]
        );
      });

      it('should add karmaConfig to the options', () => {
        karmaConfig.something = 'foobar';
        sut.edit(config);
        expect(config['karmaConfig']).to.be.eq(karmaConfig);
      });

      it('should not override existing karmaConfig', () => {
        config['karmaConfig'] = { value: 'overridden' };
        karmaConfig.value = 'base';
        karmaConfig.theAnswer = 42;
        sut.edit(config);
        expect(config['karmaConfig'].value).to.be.eq('overridden');
        expect(config['karmaConfig'].theAnswer).to.be.eq(42);
      });
    });
  });
});
