import { expect } from 'chai';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import KarmaConfigWriter from '../../src/KarmaConfigWriter';

function resolve(filePath: string) {
  return path.resolve(`testResources/configs/${filePath}`).replace(/\\/g, '/');
}

function strykerConfig(karmaConfigPath: string) {
  const config = new Config();
  config['karmaConfigFile'] = karmaConfigPath;
  return config;
}

describe('KarmaConfigWriter', () => {

  it('should override the stryker `files` property when no `files` were present', () => {
    const config = strykerConfig('testResources/configs/files-karma.conf.js');
    new KarmaConfigWriter().write(config);
    expect(config.files).to.deep.eq([
      { included: true, mutated: false, pattern: resolve('src/**/*.js') },
      { included: false, mutated: false, pattern: resolve('resources/**/*.js') },
      '!' + resolve('**/index.js'),
      '!' + resolve('+(Error|InfiniteAdd).js'),
      '!' + resolve('files-karma.conf.js')]);
  });

  it('should add to the stryker `files` property when `files` were already present', () => {
    const config = strykerConfig('testResources/configs/files-karma.conf.js');
    config.files = ['some file'];
    new KarmaConfigWriter().write(config);
    expect(config.files).to.have.length(6);
    expect(config.files[0]).to.be.eq('some file');
  });

  it('should fill the "karmaConfig" object if no "karmaConfig" object was present', () => {
    const config = strykerConfig(resolve('example-karma.conf.js'));
    new KarmaConfigWriter().write(config);

    const expectedConfig: any = {
      basePath: '',
      frameworks: ['jasmine', 'requirejs'],
      files: [
      ],
      exclude: [
        resolve('example-karma.conf.js')
      ],
      preprocessors: {
      },
      reporters: ['progress'],
      port: 9876,
      colors: true,
      logLevel: 'INFO',
      autoWatch: true,
      browsers: ['Chrome'],
      singleRun: false,
      concurrency: Infinity,
    };
    const actualConfig = config['karmaConfig'];
    for (let i in expectedConfig) {
      expect(actualConfig).to.have.property(i).with.deep.eq(expectedConfig[i], `Expected property ${i} with value ${JSON.stringify(actualConfig[i])} to eq ${JSON.stringify(expectedConfig[i])}`);
    }
  });

  it('should not do anything if no "karmaConfigFile" property is present', () => {
    const config = new Config();
    new KarmaConfigWriter().write(config);
    expect(config.files).to.not.be.ok;
    expect(config['karmaConfig']).to.not.be.ok;
  });
});