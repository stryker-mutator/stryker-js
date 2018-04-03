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
    sandbox = sinon.createSandbox();
    karmaConfigReader = { read: sandbox.stub() };
    sandbox.stub(karmaConfigReaderModule, 'default').returns(karmaConfigReader);
    config = new Config();
    config['karmaConfigFile'] = 'expectedFile';
  });

  afterEach(() => sandbox.restore());

  describe('edit', () => {

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

      it('should import karma files', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }];
        sut.edit(config);
        expect(config.karmaConfig.files).to.be.deep.eq([{ pattern: 'somePattern'}]);
      });

      it('should not override files', () => {
        config.karmaConfig = { files: [] };
        karmaConfig.files = [{ pattern: 'foobar' }];
        sut.edit(config);
        expect(config.files).undefined;
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
