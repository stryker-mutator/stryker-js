import { Config } from '@stryker-mutator/api/config';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import sinon = require('sinon');
import LibWrapper from '../../src/LibWrapper';
import { MochaOptions } from '../../src/MochaOptions';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { mochaOptionsKey } from '../../src/utils';

describe(MochaOptionsLoader.name, () => {

  let readFileStub: sinon.SinonStub;
  let existsFileStub: sinon.SinonStub;
  let config: Config;
  let sut: MochaOptionsLoader;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(MochaOptionsLoader);
  });

  describe('with mocha >= 6', () => {

    let rawOptions: { [option: string]: any };

    beforeEach(() => {
      rawOptions = Object.create(null);
      sinon.stub(LibWrapper, 'loadOptions').returns(rawOptions);
    });

    it('should log about mocha >= 6', () => {
      sut.load(testInjector.options);
      expect(testInjector.logger.debug).calledWith(
        'Mocha >= 6 detected. Using mocha\'s `%s` to load mocha options', LibWrapper.loadOptions && LibWrapper.loadOptions.name
      );
    });

    it('should call `loadOptions` with serialized arguments', () => {
      testInjector.options[mochaOptionsKey] = {
        ['no-baz']: true,
        foo: 'bar',
        spec: ['helpers/*.js', 'test/*.js']
      };
      sut.load(testInjector.options);
      expect(LibWrapper.loadOptions).calledWith(['--no-baz', '--foo', 'bar', '--spec', 'helpers/*.js,test/*.js']);
    });

    it('should filter out invalid options from the `loadOptions` result', () => {
      testInjector.options[mochaOptionsKey] = {
        override: true
      };

      // Following are valid options
      rawOptions.extension = 'foo';
      rawOptions.require = 'bar';
      rawOptions.timeout = 'baz';
      rawOptions['async-only'] = 'qux';
      rawOptions.ui = 'quux';
      rawOptions.grep = 'quuz';
      rawOptions.exclude = 'corge';
      rawOptions.file = 'grault';
      rawOptions.spec = ['test/**/*.js'];

      rawOptions.garply = 'waldo'; // this should be filtered out
      const result = sut.load(testInjector.options);
      expect(result).deep.eq({
        exclude: 'corge',
        extension: 'foo',
        file: 'grault',
        grep: 'quuz',
        opts: './test/mocha.opts',
        override: true,
        require: 'bar',
        spec: ['test/**/*.js'],
        timeout: 'baz',
        ['async-only']: 'qux',
        ui: 'quux',
      });
    });

    it('should trace log the mocha call', () => {
      testInjector.logger.isTraceEnabled.returns(true);
      testInjector.options[mochaOptionsKey] = {
        foo: 'bar'
      };
      rawOptions.baz = 'qux';
      sut.load(testInjector.options);
      const fnName = LibWrapper.loadOptions && LibWrapper.loadOptions.name;
      expect(testInjector.logger.trace).calledWith(
        `Mocha: ${fnName}(['--foo','bar']) => {"baz":"qux"}`
      );
    });

    it('should respect mocha\'s defaults', () => {
      const options = sut.load(testInjector.options);
      expect(options).deep.eq(defaultMochaOptions());
    });
  });

  describe('with mocha < 6', () => {

    beforeEach(() => {
      sinon.stub(LibWrapper, 'loadOptions').value(undefined);
      readFileStub = sinon.stub(fs, 'readFileSync');
      existsFileStub = sinon.stub(fs, 'existsSync').returns(true);
      config = new Config();
    });

    it('should log about mocha < 6', () => {
      existsFileStub.returns(false);
      sut.load(config);
      expect(testInjector.logger.debug).calledWith('Mocha < 6 detected. Using custom logic to parse mocha options');
    });

    it('should log deprecated mocha version warning', async () => {
      existsFileStub.returns(false);
      sut.load(config);
      expect(testInjector.logger.warn).calledWith('DEPRECATED: Mocha < 6 detected. Please upgrade to at least Mocha version 6.');
    });

    it('should load a mocha.opts file if specified', () => {
      readFileStub.returns('');
      config.mochaOptions = {
        opts: 'some/mocha.opts/file'
      };
      sut.load(config);
      expect(testInjector.logger.info).calledWith(`Loading mochaOpts from "${path.resolve('some/mocha.opts/file')}"`);
      expect(fs.readFileSync).calledWith(path.resolve('some/mocha.opts/file'));
    });

    it('should log an error if specified mocha.opts file doesn\'t exist', () => {
      readFileStub.returns('');
      existsFileStub.returns(false);
      config.mochaOptions = {
        opts: 'some/mocha.opts/file'
      };

      sut.load(config);
      expect(testInjector.logger.error).calledWith(`Could not load opts from "${path.resolve('some/mocha.opts/file')}". Please make sure opts file exists.`);
    });

    it('should load default mocha.opts file if not specified', () => {
      readFileStub.returns('');
      sut.load(config);
      expect(testInjector.logger.info).calledWith(`Loading mochaOpts from "${path.resolve('test/mocha.opts')}"`);
      expect(fs.readFileSync).calledWith(path.resolve('./test/mocha.opts'));
    });

    it('shouldn\'t load anything if mocha.opts = false', () => {
      config.mochaOptions = {
        opts: false
      };
      sut.load(config);
      expect(fs.readFileSync).not.called;
      expect(testInjector.logger.debug).calledWith('Not reading additional mochaOpts from a file');
    });

    it('should not load default mocha.opts file if not found', () => {
      existsFileStub.returns(false);
      const options = sut.load(config);
      expect(options).deep.eq(defaultMochaOptions());
      expect(testInjector.logger.debug).calledWith('No mocha opts file found, not loading additional mocha options (%s.opts was not defined).', 'mochaOptions');
    });

    it('should load `--require` and `-r` properties if specified in mocha.opts file', () => {
      readFileStub.returns(`
      --require  src/test/support/setup
      -r babel-require
      `);
      config.mochaOptions = { opts: '.' };
      const options = sut.load(config);
      expect(options).deep.include({
        require: [
          'src/test/support/setup',
          'babel-require'
        ]
      });
    });

    function itShouldLoadProperty(property: string, value: string, expectedConfig: Partial<MochaOptions>) {
      it(`should load '${property} if specified`, () => {
        readFileStub.returns(`${property} ${value}`);
        config.mochaOptions = { opts: 'path/to/opts/file' };
        expect(sut.load(config)).deep.include(expectedConfig);
      });
    }

    itShouldLoadProperty('--timeout', '2000', { timeout: 2000 });
    itShouldLoadProperty('-t', '2000', { timeout: 2000 });
    itShouldLoadProperty('-A', '', { asyncOnly: true });
    itShouldLoadProperty('--async-only', '', { asyncOnly: true });
    itShouldLoadProperty('--ui', 'qunit', { ui: 'qunit' });
    itShouldLoadProperty('-u', 'qunit', { ui: 'qunit' });
    itShouldLoadProperty('-g', 'grepthis', { grep: /grepthis/ });
    itShouldLoadProperty('--grep', '/grep(this|that)/', { grep: /grep(this|that)/ });
    itShouldLoadProperty('--grep', 'grep(this|that)?', { grep: /grep(this|that)?/ });

    it('should not override additional properties (except for defaults)', () => {
      readFileStub.returns(`
        -u qunit
        -t 2000
        -A
        -r babel-register
      `);
      config.mochaOptions = {
        asyncOnly: false,
        opts: 'path/to/opts/file',
        require: ['ts-node/register'],
        timeout: 4000,
        ui: 'exports'
      };
      const options = sut.load(config);
      expect(options).deep.equal({
        asyncOnly: false,
        extension: ['js'],
        opts: 'path/to/opts/file',
        require: ['ts-node/register'],
        spec: ['test'],
        timeout: 4000,
        ui: 'exports'
      });
    });

    it('should ignore additional properties', () => {
      readFileStub.returns(`
      --reporter dot
      --ignore-leaks
      `);
      config.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };
      const options = sut.load(config);
      expect(options).not.have.property('reporter');
      expect(options).not.have.property('ignore-leaks');
      expect(testInjector.logger.debug).calledWith('Ignoring option "--reporter" as it is not supported.');
      expect(testInjector.logger.debug).calledWith('Ignoring option "--ignore-leaks" as it is not supported.');
    });

    it('should ignore invalid --ui and --timeout options', () => {
      readFileStub.returns(`
      --timeout
      --ui
      `);
      config.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };
      const options = sut.load(config);
      expect(options).deep.eq({
        extension: ['js'],
        opts: 'some/mocha.opts/file',
        spec: [
          'test'
        ],
        timeout: undefined,
        ui: undefined
      });
    });
  });

  function defaultMochaOptions()  {
    return {
      extension: ['js'],
      opts: './test/mocha.opts',
      spec: ['test'],
      timeout: 2000,
      ui: 'bdd'
    };
  }

});
