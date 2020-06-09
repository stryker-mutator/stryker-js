import * as fs from 'fs';
import * as path from 'path';

import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { BabelConfigReader } from '../../src/BabelConfigReader';
import { BabelTranspilerOptions, StrykerBabelConfig } from '../../src-generated/babel-transpiler-options';
import { createStrykerBabelConfig } from '../helpers/factories';

describe(BabelConfigReader.name, () => {
  let sut: BabelConfigReader;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(BabelConfigReader);
  });

  it('should read babel configuration from StrykerOptions', () => {
    const babelConfig: StrykerBabelConfig = {
      extensions: ['.ts'],
      options: {
        presets: ['env'],
      },
      optionsFile: null,
    };
    const options = factory.strykerWithPluginOptions({ babel: babelConfig });
    const result = sut.readConfig(options);
    expect(result).deep.eq(babelConfig);
  });

  it('should read the .babelrc file from disk by default', () => {
    // Arrange
    const babelOptions = { presets: ['env'] };
    arrangeBabelOptionsFile(babelOptions, '.babelrc');
    const result = sut.readConfig(factory.strykerWithPluginOptions({ babel: createStrykerBabelConfig() }));
    expect(result.options).deep.eq(babelOptions);
    expect(result.optionsFile).deep.eq('.babelrc');
  });

  it('should log the path to the babelrc file', () => {
    arrangeBabelOptionsFile({});
    sut.readConfig(factory.strykerWithPluginOptions({ babel: createStrykerBabelConfig() }));
    expect(testInjector.logger.debug).calledWith(`Reading .babelrc file from path "${path.resolve('.babelrc')}"`);
  });

  it('should log the babel config', () => {
    const expectedConfig: StrykerBabelConfig = {
      extensions: ['.ts'],
      options: { presets: ['env'] },
      optionsFile: null,
    };
    sut.readConfig(factory.strykerWithPluginOptions({ babel: expectedConfig }));
    expect(testInjector.logger.debug).calledWith(`Babel config is: ${JSON.stringify(expectedConfig, null, 2)}`);
  });

  it('should log a warning if the babelrc file does not exist', () => {
    const babelConfig = {
      optionsFile: '.nonExistingBabelrc',
    };
    sut.readConfig(factory.strykerWithPluginOptions({ babel: createStrykerBabelConfig(babelConfig) }));
    expect(testInjector.logger.error).calledWith(`babelrc file does not exist at: ${path.resolve(babelConfig.optionsFile)}`);
  });

  it('should log a warning if the babelrc file cannot be read', () => {
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path.resolve('.babelrc'), 'utf8').returns('something, not json');
    sut.readConfig(
      factory.strykerWithPluginOptions<BabelTranspilerOptions>({ babel: createStrykerBabelConfig() })
    );
    expect(testInjector.logger.error).calledWith(
      `Error while reading "${path.resolve('.babelrc')}" file: SyntaxError: Unexpected token s in JSON at position 0`
    );
  });

  it("should set the babelConfig to an empty object if nothing is configured and .babelrc file didn't exits", () => {
    const expected: StrykerBabelConfig = {
      extensions: [],
      options: {},
      optionsFile: '.babelrc',
    };
    const result = sut.readConfig(factory.strykerWithPluginOptions({ babel: expected }));
    expect(result).deep.equal(expected);
  });

  function arrangeBabelOptionsFile(babelOptions: babel.TransformOptions, fileName = '.babelrc') {
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path.resolve(fileName), 'utf8').returns(JSON.stringify(babelOptions));
  }
});
