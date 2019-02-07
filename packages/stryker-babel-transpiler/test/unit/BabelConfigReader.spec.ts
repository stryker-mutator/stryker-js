import { BabelConfigReader, StrykerBabelConfig, DEPRECATED_CONFIG_KEY_FILE, DEPRECATED_CONFIG_KEY_OPTIONS } from '../../src/BabelConfigReader';
import { expect } from 'chai';
import * as fs from 'fs';
import * as logging from 'stryker-api/logging';
import * as sinon from 'sinon';
import * as path from 'path';
import { factory } from '../../../stryker-test-helpers/src';

describe(BabelConfigReader.name, () => {
  let logStub: {
    trace: sinon.SinonStub,
    info: sinon.SinonStub,
    error: sinon.SinonStub,
    debug: sinon.SinonStub,
    warn: sinon.SinonStub
  };
  let sut: BabelConfigReader;

  beforeEach(() => {
    logStub = {
      debug: sinon.stub(),
      error: sinon.stub(),
      info: sinon.stub(),
      trace: sinon.stub(),
      warn: sinon.stub()
    };

    sinon.stub(logging, 'getLogger').returns(logStub);
    sut = new BabelConfigReader();
  });

  it('should read babel configuration from StrykerOptions', () => {
    const babelConfig: Partial<StrykerBabelConfig> = {
      extensions: ['.ts'],
      options: {
        presets: ['env']
      },
      optionsFile: null
    };
    const options = factory.strykerOptions({ babel: babelConfig });
    const result = sut.readConfig(options);
    expect(result).deep.eq(babelConfig);
  });

  it('should read the .babelrc file from disk by default', () => {
    // Arrange
    const babelOptions = { presets: ['env'] };
    arrangeBabelOptionsFile(babelOptions, '.babelrc');
    const result = sut.readConfig(factory.strykerOptions());
    expect(result.options).deep.eq(babelOptions);
    expect(result.optionsFile).deep.eq('.babelrc');
  });

  it('should log the path to the babelrc file', () => {
    arrangeBabelOptionsFile({});
    sut.readConfig(factory.strykerOptions());
    expect(logStub.debug).calledWith(`Reading .babelrc file from path "${path.resolve('.babelrc')}"`);
  });

  it('should log the babel config', () => {
    const expectedConfig: StrykerBabelConfig = {
      extensions: ['.ts'],
      options: { presets: ['env'] },
      optionsFile: null,
    };
    sut.readConfig(factory.strykerOptions({ babel: expectedConfig }));
    expect(logStub.debug).calledWith(`Babel config is: ${JSON.stringify(expectedConfig, null, 2)}`);
  });

  it('should log a warning if the babelrc file does not exist', () => {
    const babelConfig = {
      optionsFile: '.nonExistingBabelrc'
    };
    sut.readConfig(factory.strykerOptions({ babel: babelConfig }));
    expect(logStub.error).calledWith(`babelrc file does not exist at: ${path.resolve(babelConfig.optionsFile)}`);
  });

  it('should log a warning if the babelrc file cannot be read', () => {
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path.resolve('.babelrc'), 'utf8').returns('something, not json');
    sut.readConfig(factory.strykerOptions());
    expect(logStub.error).calledWith(`Error while reading "${path.resolve('.babelrc')}" file: SyntaxError: Unexpected token s in JSON at position 0`);
  });

  it('should set the babelConfig to an empty object if nothing is configured and .babelrc file didn\'t exits', () => {
    const expected: StrykerBabelConfig = {
      extensions: [],
      options: {},
      optionsFile: '.babelrc'
    };
    const result = sut.readConfig(factory.strykerOptions());
    expect(result).deep.equal(expected);
  });

  it('should load deprecated properties', () => {
    // Arrange
    const expectedBabelConfig: StrykerBabelConfig = {
      extensions: [],
      options: {
        auxiliaryCommentAfter: 'bar',
        auxiliaryCommentBefore: 'foo'
      },
      optionsFile: 'foo.babelrc'
    };
    const strykerOptions = factory.strykerOptions({
      [DEPRECATED_CONFIG_KEY_FILE]: expectedBabelConfig.optionsFile,
      [DEPRECATED_CONFIG_KEY_OPTIONS]: { auxiliaryCommentBefore: 'foo' }
    });
    arrangeBabelOptionsFile({ auxiliaryCommentAfter: 'bar' }, 'foo.babelrc');

    // Act
    const result = sut.readConfig(strykerOptions);

    // Assert
    expect(result).deep.eq(expectedBabelConfig);
    expect(logStub.warn).calledWith(`"babelConfig" is deprecated, please use { babel: { options: {"auxiliaryCommentBefore":"foo"} }`);
    expect(logStub.warn).calledWith(`"babelrcFile" is deprecated, please use { babel: { optionsFile: 'foo.babelrc' } }`);
  });

  function arrangeBabelOptionsFile(babelOptions: babel.TransformOptions, fileName = '.babelrc') {
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path.resolve(fileName), 'utf8').returns(JSON.stringify(babelOptions));
  }

});
