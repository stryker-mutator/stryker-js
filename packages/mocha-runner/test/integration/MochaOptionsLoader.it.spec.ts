import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { MochaOptions } from '../../src-generated/mocha-runner-options';
import { MochaOptionsLoader, DEFAULT_MOCHA_OPTIONS } from '../../src/MochaOptionsLoader';
import { MochaRunnerWithStrykerOptions } from '../../src/MochaRunnerWithStrykerOptions';

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
      ...DEFAULT_MOCHA_OPTIONS,
      config: configFile,
      opts: './test/mocha.opts',
      package: false, // mocha sets package: false after loading it...
      extension: ['js'],
      timeout: 2000,
      ui: 'bdd',
    });
  });

  it('should support loading from ".mocharc.json"', () => {
    const configFile = resolveMochaConfig('.mocharc.json');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      ...DEFAULT_MOCHA_OPTIONS,
      opts: './test/mocha.opts',
      package: false, // mocha sets package: false after loading it...
      config: configFile,
      extension: ['json', 'js'],
      timeout: 2000,
      ui: 'bdd',
    });
  });

  it('should support loading from ".mocharc.jsonc"', () => {
    const configFile = resolveMochaConfig('.mocharc.jsonc');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      ...DEFAULT_MOCHA_OPTIONS,
      config: configFile,
      opts: './test/mocha.opts',
      package: false, // mocha sets package: false after loading it...
      extension: ['jsonc', 'js'],
      timeout: 2000,
      ui: 'bdd',
    });
  });

  it('should support loading from ".mocharc.yml"', () => {
    const configFile = resolveMochaConfig('.mocharc.yml');
    const actualConfig = actLoad({ config: configFile });
    expect(actualConfig).deep.eq({
      ...DEFAULT_MOCHA_OPTIONS,
      'async-only': false,
      config: configFile,
      opts: './test/mocha.opts',
      package: false, // mocha sets package: false after loading it...
      extension: ['yml', 'js'],
      file: ['/path/to/some/file', '/path/to/some/other/file'],
      ignore: ['/path/to/some/excluded/file'],
      require: ['@babel/register'],
      spec: ['test/**/*.spec.js'],
      timeout: false,
      ui: 'bdd',
    });
  });

  it('should support loading from "package.json"', () => {
    const pkgFile = resolveMochaConfig('package.json');
    const actualConfig = actLoad({ package: pkgFile });
    expect(actualConfig).deep.include({
      ['async-only']: true,
      extension: ['json'],
      timeout: 20,
      ui: 'tdd',
    });
  });

  it('should respect mocha default file order', () => {
    process.chdir(resolveMochaConfig('.'));
    const actualConfig = actLoad({});
    expect(actualConfig).deep.include({
      ['async-only']: true,
      extension: ['js', 'json'],
      timeout: 2000,
      ui: 'bdd',
    });
  });

  it('should support `no-config`, `no-opts` and `no-package` keys', () => {
    process.chdir(resolveMochaConfig('.'));
    const actualConfig = actLoad({
      'no-config': true,
      'no-package': true,
      'no-opts': true,
    });
    const expectedOptions = {
      extension: ['js', 'cjs', 'mjs'],
      ['no-config']: true,
      ['no-opts']: true,
      ['no-package']: true,
      timeout: 2000,
      ui: 'bdd',
    };
    expect(actualConfig).deep.include(expectedOptions);
  });

  function resolveMochaConfig(relativeName: string) {
    return path.resolve(__dirname, '..', '..', 'testResources', 'mocha-config', relativeName);
  }

  function actLoad(mochaConfig: MochaOptions): MochaOptions {
    const mochaRunnerWithStrykerOptions = testInjector.options as MochaRunnerWithStrykerOptions;
    mochaRunnerWithStrykerOptions.mochaOptions = mochaConfig;
    return sut.load(mochaRunnerWithStrykerOptions);
  }

  function createSut() {
    return testInjector.injector.injectClass(MochaOptionsLoader);
  }
});
