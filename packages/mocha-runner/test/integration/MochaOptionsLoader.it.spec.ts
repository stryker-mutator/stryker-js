import * as path from 'path';
import { testInjector } from '@stryker-mutator/test-helpers';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { expect } from 'chai';
import { mochaOptionsKey } from '../../src/utils';

describe(`${MochaOptionsLoader.name} integration`, () => {
  let sut: MochaOptionsLoader;
  const cwd = process.cwd();

  beforeEach(() => {
    sut = createSut();
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should support loading from ".mocharc.js"', () => {
    const configFile = resolveMochaConfig('.mocharc.js');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      config: configFile,
      extension: ['js'],
      timeout: 2000,
      ui: 'bdd'
    });
  });

  it('should support loading from ".mocharc.json"', () => {
    const configFile = resolveMochaConfig('.mocharc.json');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      config: configFile,
      extension: ['json', 'js'],
      timeout: 2000,
      ui: 'bdd'
    });
  });

  it('should support loading from ".mocharc.jsonc"', () => {
    const configFile = resolveMochaConfig('.mocharc.jsonc');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      config: configFile,
      extension: ['jsonc', 'js'],
      timeout: 2000,
      ui: 'bdd'
    });
  });

  it('should support loading from ".mocharc.yml"', () => {
    const configFile = resolveMochaConfig('.mocharc.yml');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      ['async-only']: false,
      config: configFile,
      exclude: [
        '/path/to/some/excluded/file'
      ],
      extension: [
        'yml',
        'js'
      ],
      file: [
        '/path/to/some/file',
        '/path/to/some/other/file'
      ],
      require: [
        '@babel/register'
      ],
      timeout: 0,
      ui: 'bdd'
    });
  });

  it('should support loading from "package.json"', () => {
    const pkgFile = resolveMochaConfig('package.json');
    const actualConfig = actLoad({ package: pkgFile });
    expect(actualConfig).deep.eq({
      ['async-only']: true,
      extension: ['json', 'js'],
      package: pkgFile,
      timeout: 20,
      ui: 'tdd'
    });
  });

  it('should respect mocha default file order', () => {
    process.chdir(resolveMochaConfig('.'));
    const actualConfig = actLoad({});
    expect(actualConfig).deep.eq({
      ['async-only']: true,
      extension: [
        'js',
        'json'
      ],
      timeout: 2000,
      ui: 'bdd'
    });
  });

  it('should support `no-config`, `no-opts` and `no-package` keys', () => {
    process.chdir(resolveMochaConfig('.'));
    const actualConfig = actLoad({
      ['no-config']: true,
      ['no-package']: true,
      ['no-opts']: true
    });
    const expectedOptions = {
      extension: ['js'],
      ['no-config']: true,
      ['no-opts']: true,
      ['no-package']: true,
      timeout: 2000,
      ui: 'bdd'
    };
    expect(actualConfig).deep.eq(expectedOptions);
  });

  function resolveMochaConfig(relativeName: string) {
    return path.resolve(__dirname, '..', '..', 'testResources', 'mocha-config', relativeName);
  }

  function actLoad(mochaConfig: { [key: string]: any }): MochaOptions {
    testInjector.options[mochaOptionsKey] = mochaConfig;
    return sut.load(testInjector.options);
  }

  function createSut() {
    return testInjector.injector.injectClass(MochaOptionsLoader);
  }
});
