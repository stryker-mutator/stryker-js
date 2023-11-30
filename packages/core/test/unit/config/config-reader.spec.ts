import fs from 'fs';
import { syncBuiltinESMExports } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { expect } from 'chai';

import { ConfigReader, OptionsValidator } from '../../../src/config/index.js';
import { ConfigError } from '../../../src/errors.js';
import { coreTokens } from '../../../src/di/index.js';
import { fileUtils } from '../../../src/utils/file-utils.js';

describe(ConfigReader.name, () => {
  let sut: ConfigReader;
  let existsStub: sinon.SinonStubbedMember<(typeof fileUtils)['exists']>;
  let readFileStub: sinon.SinonStubbedMember<(typeof fs.promises)['readFile']>;
  let importModuleStub: sinon.SinonStubbedMember<(typeof fileUtils)['importModule']>;
  let optionsValidatorMock: sinon.SinonStubbedInstance<OptionsValidator>;

  beforeEach(() => {
    existsStub = sinon.stub(fileUtils, 'exists');
    optionsValidatorMock = sinon.createStubInstance(OptionsValidator);
    readFileStub = sinon.stub(fs.promises, 'readFile');
    importModuleStub = sinon.stub(fileUtils, 'importModule');
    syncBuiltinESMExports();
    sut = testInjector.injector.provideValue(coreTokens.optionsValidator, optionsValidatorMock).injectClass(ConfigReader);
  });

  it('should be able to read config from a custom JSON file', async () => {
    // Arrange
    const expectedOptions = { testRunner: 'my-runner', configFile: 'file.json' };
    existsStub.withArgs('file.json').resolves(true);
    readFileStub.resolves(JSON.stringify(expectedOptions));

    // Act
    const result = await sut.readConfig({ configFile: 'file.json' });

    // Assert
    sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
    sinon.assert.calledWithExactly(readFileStub, 'file.json', 'utf-8');
    expect(result).deep.eq(expectedOptions);
    expect(testInjector.logger.warn).not.called;
  });

  it('should be able to import from a custom JS file', async () => {
    // Arrange
    const expectedOptions = { testRunner: 'my-runner', configFile: 'file.js' };
    existsStub.withArgs('file.js').resolves(true);
    readFileStub.resolves(JSON.stringify(expectedOptions));
    importModuleStub.withArgs(pathToFileURL(path.resolve('file.js')).toString()).resolves({ default: expectedOptions });

    // Act
    const result = await sut.readConfig({ configFile: 'file.js' });

    // Assert
    sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
    expect(result).deep.eq(expectedOptions);
    expect(testInjector.logger.warn).not.called;
  });

  ['stryker.conf', '.stryker.conf', 'stryker.config', '.stryker.config'].forEach((base) => {
    it(`should load ${base}.json file by default`, async () => {
      // Arrange
      const expectedOptions = { testRunner: 'my-runner' };
      existsStub.withArgs(`${base}.json`).resolves(true);
      readFileStub.resolves(JSON.stringify(expectedOptions));

      // Act
      const result = await sut.readConfig({});

      // Assert
      sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
      expect(result).deep.eq(expectedOptions);
    });

    ['js', 'mjs', 'cjs'].forEach((ext) => {
      it(`should load ${base}.${ext} by default`, async () => {
        // Arrange
        const strykerConfFile = `${base}.${ext}`;
        const expectedOptions = { testRunner: 'my-runner' };
        existsStub.withArgs(strykerConfFile).resolves(true);
        readFileStub.resolves(JSON.stringify(expectedOptions));
        importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({ default: expectedOptions });

        // Act
        const result = await sut.readConfig({});

        // Assert
        sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
        expect(result).deep.eq(expectedOptions);
      });
    });
  });

  it('should use cli options if no config file is available', async () => {
    // Arrange
    const expectedOptions = { testRunner: 'my-runner' };
    existsStub.resolves(false);

    // Act
    const result = await sut.readConfig(expectedOptions);

    // Assert
    expect(importModuleStub).not.called;
    expect(readFileStub).not.called;
    sinon.assert.calledWithExactly(testInjector.logger.info, 'No config file specified. Running with command line arguments.');
    sinon.assert.calledWithExactly(testInjector.logger.info, 'Use `stryker init` command to generate your config file.');
    sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
    expect(result).deep.eq(expectedOptions);
  });

  it('should override loaded config with cli options (cli takes precedence)', async () => {
    // Arrange
    existsStub.withArgs('stryker.conf.json').resolves(true);
    readFileStub.resolves(JSON.stringify({ testRunner: 'my-runner', concurrency: 3 }));

    // Act
    const result = await sut.readConfig({ concurrency: 2 });

    // Assert
    const expectedOptions = { testRunner: 'my-runner', concurrency: 2 };
    sinon.assert.calledWithExactly(optionsValidatorMock.validate, expectedOptions);
    expect(result).deep.eq(expectedOptions);
  });

  it('should throw a config error and log details when the loaded configuration is not an object', async () => {
    // Arrange
    const strykerConfFile = 'stryker.conf.js';
    existsStub.withArgs(strykerConfFile).resolves(true);
    importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({ default: 42 });

    // Act & assert
    const error = await expect(sut.readConfig({})).rejectedWith(
      'Invalid config file "stryker.conf.js". Default export of config file must be an object!',
    );
    expect(error).instanceOf(ConfigError);
    sinon.assert.calledWithMatch(testInjector.logger.fatal, sinon.match('Invalid config file. It must export an object, found a "number"!'));
    sinon.assert.calledWithMatch(testInjector.logger.fatal, sinon.match('Example of how a config file should look:'));
  });

  it('should throw when the .json config could not be read', async () => {
    // Arrange
    existsStub.withArgs('stryker.conf.json').resolves(true);
    const expectedError = new Error('Cannot read file.');
    readFileStub.rejects(expectedError);

    // Act & assert
    await expect(sut.readConfig({})).rejectedWith(expectedError);
  });

  it("should throw when the explicit config file doesn't exist", async () => {
    existsStub.resolves(false);
    const error = await expect(sut.readConfig({ configFile: 'foo.conf.js' })).rejectedWith('Invalid config file "foo.conf.js". File does not exist!');
    expect(error).instanceOf(ConfigError);
  });

  it('should throw when the imported file contains invalid js', async () => {
    const syntaxError = new Error('SyntaxError');
    existsStub.withArgs('stryker.conf.js').resolves(true);
    importModuleStub.rejects(syntaxError);
    const error = await expect(sut.readConfig({})).rejectedWith('Invalid config file "stryker.conf.js". Error during import.');
    expect(error).instanceOf(ConfigError);
    expect((error as ConfigError).innerError).eq(syntaxError);
  });

  describe('logging', () => {
    it('should log a specific deprecation error when the loaded configuration is a function', async () => {
      // Arrange
      const strykerConfFile = 'stryker.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({
        default: () => {
          /* idle */
        },
      });

      // Act & assert
      const error = await expect(sut.readConfig({})).rejectedWith(
        'Invalid config file "stryker.conf.js". Default export of config file must be an object!',
      );
      expect(error).instanceOf(ConfigError);
      sinon.assert.calledWithMatch(
        testInjector.logger.fatal,
        sinon.match(
          'Invalid config file. Exporting a function is no longer supported. Please export an object with your configuration instead, or use a "stryker.conf.json" file.',
        ),
      );
    });

    it('should log a specific error when there is no default export in the loaded configuration module', async () => {
      // Arrange
      const strykerConfFile = 'stryker.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({ pi: 3.14, foo: 'bar' });

      // Act & assert
      const error = await expect(sut.readConfig({})).rejectedWith('Invalid config file "stryker.conf.js". Config file must have a default export!');
      expect(error).instanceOf(ConfigError);
      sinon.assert.calledWithMatch(
        testInjector.logger.fatal,
        sinon.match('Invalid config file. It is missing a default export. Found named export(s): "pi", "foo".'),
      );
    });

    it('should log a specific error when nothing is exported from the configuration module', async () => {
      // Arrange
      const strykerConfFile = 'stryker.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({});

      // Act & assert
      await expect(sut.readConfig({})).rejectedWith('Invalid config file "stryker.conf.js". Config file must have a default export!');
      sinon.assert.calledWithMatch(
        testInjector.logger.fatal,
        sinon.match("Invalid config file. It is missing a default export. In fact, it didn't export anything"),
      );
    });

    it('should log a specific error when imported module configuration module is a number somehow', async () => {
      // Arrange
      const strykerConfFile = 'stryker.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves(42);

      // Act & assert
      await expect(sut.readConfig({})).rejected;
      sinon.assert.calledWithMatch(
        testInjector.logger.fatal,
        sinon.match("Invalid config file. It is missing a default export. In fact, it didn't export anything"),
      );
    });

    it("should log an error when the .json config couldn't be parsed", async () => {
      // Arrange
      existsStub.withArgs('stryker.conf.json').resolves(true);
      readFileStub.resolves('{ not: "json" }');

      // Act & assert
      const error = await expect(sut.readConfig({})).rejectedWith('Invalid config file "stryker.conf.json". File contains invalid JSON');

      // Assert
      expect(error).instanceOf(ConfigError);
      expect(((error as ConfigError).innerError as Error).message).matches(/JSON at position 2/);
    });

    it('should the final configuration to debug', async () => {
      // Arrange
      testInjector.logger.isDebugEnabled.returns(true);
      existsStub.withArgs('stryker.conf.json').resolves(true);
      readFileStub.resolves(JSON.stringify({ testRunner: 'my-runner', concurrency: 3 }));

      // Act
      await sut.readConfig({ concurrency: 2 });

      // Assert
      const expectedOptions = { testRunner: 'my-runner', concurrency: 2 };
      sinon.assert.calledWithExactly(testInjector.logger.debug, `Loaded config: ${JSON.stringify(expectedOptions, null, 2)}`);
    });

    it('should not log final configuration to debug when debug logging is not enabled', async () => {
      // Arrange
      testInjector.logger.isDebugEnabled.returns(false);

      // Act
      await sut.readConfig({ concurrency: 2 });

      // Assert
      sinon.assert.neverCalledWithMatch(testInjector.logger.debug, sinon.match('Loaded config:'));
    });

    it('should log the file it is reading to debug', async () => {
      existsStub.withArgs('stryker.conf.json').resolves(true);
      readFileStub.resolves('{}');
      await sut.readConfig({ concurrency: 2 });
      sinon.assert.calledWithExactly(testInjector.logger.debug, 'Loading config from stryker.conf.json');
    });

    it('should log a warning when the loaded config was empty', async () => {
      // Arrange
      const strykerConfFile = 'foo.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({ default: {} });

      // Act
      await sut.readConfig({ configFile: 'foo.conf.js' });

      // Assert
      sinon.assert.calledWithMatch(
        testInjector.logger.warn,
        sinon.match('Stryker options were empty. Did you forget to export options from foo.conf.js?'),
      );
    });

    it('should log a warning when the loaded config was nullish', async () => {
      // Arrange
      const strykerConfFile = 'foo.conf.js';
      existsStub.withArgs(strykerConfFile).resolves(true);
      importModuleStub.withArgs(pathToFileURL(path.resolve(strykerConfFile)).toString()).resolves({ default: null });

      // Act
      await sut.readConfig({ configFile: 'foo.conf.js' });

      // Assert
      sinon.assert.calledWithMatch(
        testInjector.logger.warn,
        sinon.match('Stryker options were empty. Did you forget to export options from foo.conf.js?'),
      );
    });
  });
});
