import fs from 'fs';
import path from 'path';

import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { LibWrapper } from '../../src/lib-wrapper.js';
import { MochaOptions } from '../../src-generated/mocha-runner-options.js';
import { MochaOptionsLoader } from '../../src/mocha-options-loader.js';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options.js';

describe(MochaOptionsLoader.name, () => {
  let readFileStub: sinon.SinonStub;
  let existsFileStub: sinon.SinonStub;
  let options: MochaRunnerWithStrykerOptions;
  let sut: MochaOptionsLoader;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(MochaOptionsLoader);
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = {};
  });

  describe('with mocha >= 6', () => {
    let rawOptions: Record<string, any>;

    beforeEach(() => {
      rawOptions = Object.create(null);
      sinon.stub(LibWrapper, 'loadOptions').returns(rawOptions);
    });

    it('should log about mocha >= 6', () => {
      sut.load(options);
      expect(testInjector.logger.debug).calledWith("Mocha >= 6 detected. Using mocha's `%s` to load mocha options", LibWrapper.loadOptions?.name);
    });

    it('should call `loadOptions` with serialized arguments', () => {
      options.mochaOptions = {
        'no-config': true,
        'no-opts': true,
        'no-package': true,
        package: 'alternative-package.json',
        config: 'alternative-config.yaml',
        opts: 'alternative.opts',
        extension: ['.js'], // should not appear in serialized arguments
      };
      sut.load(options);
      expect(LibWrapper.loadOptions).calledWith([
        '--no-config',
        '--no-opts',
        '--no-package',
        '--package',
        'alternative-package.json',
        '--opts',
        'alternative.opts',
        '--config',
        'alternative-config.yaml',
      ]);
    });

    it('should filter out invalid options from the `loadOptions` result', () => {
      // Following are valid options
      rawOptions.extension = ['foo'];
      rawOptions.require = ['bar'];
      rawOptions['async-only'] = true;
      rawOptions.ui = 'qunit';
      rawOptions.grep = 'quuz';
      rawOptions.ignore = ['garply'];
      rawOptions.file = ['grault'];
      rawOptions.spec = ['test/**/*.js'];

      rawOptions.garply = 'waldo'; // this should be filtered out
      const result = sut.load(options);
      const expected = createMochaOptions({
        extension: ['foo'],
        file: ['grault'],
        grep: 'quuz',
        ignore: ['garply'],
        opts: './test/mocha.opts',
        require: ['bar'],
        spec: ['test/**/*.js'],
        'async-only': true,
        ui: 'qunit',
      });
      expect(result).deep.contains(expected);
    });

    it('should trace log the mocha call', () => {
      testInjector.logger.isTraceEnabled.returns(true);
      options.mochaOptions = {
        'no-config': true,
      };
      rawOptions.baz = 'qux';
      sut.load(options);
      const fnName = LibWrapper.loadOptions?.name;
      expect(testInjector.logger.trace).calledWith(`Mocha: ${fnName}(['--no-config']) => {"baz":"qux"}`);
    });

    it("should respect mocha's defaults", () => {
      const actualOptions = sut.load(options);
      expect(actualOptions).deep.contains(createMochaOptions());
    });

    it('should not allow to set parallel', () => {
      rawOptions.parallel = true;
      const actualOptions = sut.load(options);
      expect((actualOptions as any).parallel).undefined;
    });
  });

  describe('with mocha < 6', () => {
    beforeEach(() => {
      sinon.stub(LibWrapper, 'loadOptions').value(undefined);
      readFileStub = sinon.stub(fs, 'readFileSync');
      existsFileStub = sinon.stub(fs, 'existsSync').returns(true);
    });

    it('should log about mocha < 6', () => {
      existsFileStub.returns(false);
      sut.load(options);
      expect(testInjector.logger.debug).calledWith('Mocha < 6 detected. Using custom logic to parse mocha options');
    });

    it('should log deprecated mocha version warning', () => {
      existsFileStub.returns(false);
      sut.load(options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED: Mocha < 6 detected. Please upgrade to at least Mocha version 6. Stryker will drop support for Mocha < 6 in V5.',
      );
    });

    it('should load a mocha.opts file if specified', () => {
      readFileStub.returns('');
      options.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };
      sut.load(options);
      expect(testInjector.logger.info).calledWith(`Loading mochaOpts from "${path.resolve('some/mocha.opts/file')}"`);
      expect(fs.readFileSync).calledWith(path.resolve('some/mocha.opts/file'));
    });

    it("should log an error if specified mocha.opts file doesn't exist", () => {
      readFileStub.returns('');
      existsFileStub.returns(false);
      options.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };

      sut.load(options);
      expect(testInjector.logger.error).calledWith(
        `Could not load opts from "${path.resolve('some/mocha.opts/file')}". Please make sure opts file exists.`,
      );
    });

    it('should load default mocha.opts file if not specified', () => {
      readFileStub.returns('');
      sut.load(options);
      expect(testInjector.logger.info).calledWith(`Loading mochaOpts from "${path.resolve('test/mocha.opts')}"`);
      expect(fs.readFileSync).calledWith(path.resolve('./test/mocha.opts'));
    });

    it("shouldn't load anything if mocha['no-opts'] = true", () => {
      options.mochaOptions = {
        'no-opts': true,
      };
      sut.load(options);
      expect(fs.readFileSync).not.called;
      expect(testInjector.logger.debug).calledWith('Not reading additional mochaOpts from a file');
    });

    it('should not load default mocha.opts file if not found', () => {
      existsFileStub.returns(false);
      const mochaOptions = sut.load(options);
      expect(mochaOptions).deep.contains(createMochaOptions());
      expect(testInjector.logger.debug).calledWith(
        'No mocha opts file found, not loading additional mocha options (%s was not defined).',
        'mochaOptions.opts',
      );
    });

    it('should load `--require` and `-r` properties if specified in mocha.opts file', () => {
      readFileStub.returns(`
      --require  src/test/support/setup
      -r babel-require
      `);
      options.mochaOptions = { opts: '.' };
      const mochaOptions = sut.load(options);
      expect(mochaOptions).deep.include({
        require: ['src/test/support/setup', 'babel-require'],
      });
    });

    function itShouldLoadProperty(property: string, value: string, expectedConfig: Partial<MochaOptions>) {
      it(`should load '${property} if specified`, () => {
        readFileStub.returns(`${property} ${value}`);
        options.mochaOptions = { opts: 'path/to/opts/file' };
        expect(sut.load(options)).deep.include(expectedConfig);
      });
    }

    itShouldLoadProperty('-A', '', { 'async-only': true });
    itShouldLoadProperty('--async-only', '', { 'async-only': true });
    itShouldLoadProperty('--ui', 'qunit', { ui: 'qunit' });
    itShouldLoadProperty('-u', 'qunit', { ui: 'qunit' });
    itShouldLoadProperty('-g', 'grepthis', { grep: 'grepthis' });
    itShouldLoadProperty('--grep', '/grep(this|that)/', { grep: 'grep(this|that)' });
    itShouldLoadProperty('--grep', 'grep(this|that)?', { grep: 'grep(this|that)?' });

    it('should not override additional properties (except for defaults)', () => {
      readFileStub.returns(`
        -u qunit
        -t 2000
        -A
        -r babel-register
      `);
      options.mochaOptions = {
        'async-only': false,
        opts: 'path/to/opts/file',
        require: ['ts-node/register'],
        ui: 'exports',
      };
      const mochaOptions = sut.load(options);
      expect(mochaOptions).deep.contains(
        createMochaOptions({
          'async-only': false,
          extension: ['js'],
          opts: 'path/to/opts/file',
          require: ['ts-node/register'],
          spec: ['test'],
          ui: 'exports',
        }),
      );
    });

    it('should ignore additional properties', () => {
      readFileStub.returns(`
      --reporter dot
      --ignore-leaks
      `);
      options.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };
      const mochaOptions = sut.load(options);
      expect(mochaOptions).not.have.property('reporter');
      expect(mochaOptions).not.have.property('ignore-leaks');
      expect(testInjector.logger.debug).calledWith('Ignoring option "--reporter" as it is not supported.');
      expect(testInjector.logger.debug).calledWith('Ignoring option "--ignore-leaks" as it is not supported.');
    });

    it('should ignore invalid --ui and --timeout options', () => {
      readFileStub.returns(`
      --timeout
      --ui
      `);
      options.mochaOptions = {
        opts: 'some/mocha.opts/file',
      };
      const mochaOptions = sut.load(options);
      expect(mochaOptions).deep.contain(
        createMochaOptions({
          extension: ['js'],
          opts: 'some/mocha.opts/file',
          spec: ['test'],
          ui: 'bdd',
        }),
      );
    });
  });

  function createMochaOptions(overrides?: Partial<MochaOptions>): MochaOptions {
    return {
      'async-only': false,
      'no-config': false,
      'no-opts': false,
      require: [],
      'no-package': false,
      extension: ['js'],
      file: [],
      ignore: [],
      opts: './test/mocha.opts',
      spec: ['test'],
      ui: 'bdd',
      ...overrides,
    };
  }
});
