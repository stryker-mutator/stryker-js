import { expect } from 'chai';
import * as path from 'path';
import KarmaConfigReader from '../../src/KarmaConfigReader';

function resolve(filePath: string) {
  return path.resolve(`testResources/configs/${filePath}`).replace(/\\/g, '/');
}

describe('KarmaConfigReader integration', () => {

  it('should fill the "karmaConfig" object if no "karmaConfig" object was present', () => {

    const expectedConfig: any = {
      basePath: '',
      frameworks: ['jasmine', 'requirejs'],
      files: [
      ],
      exclude: [
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
    const actualConfig = new KarmaConfigReader(resolve('example-karma.conf.js')).read();
    for (let i in expectedConfig) {
      expect(actualConfig).to.have.property(i).with.deep.eq(expectedConfig[i]);
    }
  });

  it('should not do anything if no "karmaConfigFile" property is present', () => {
    const config = new KarmaConfigReader(undefined).read();
    expect(config).to.not.be.ok;
  });
});