import { EventEmitter } from 'events';
import * as path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { RunOptions } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as Mocha from 'mocha';

import sinon = require('sinon');
import LibWrapper from '../../src/LibWrapper';
import { MochaOptions } from '../../src-generated/mocha-runner-options';
import { MochaTestRunner } from '../../src/MochaTestRunner';
import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';
import * as utils from '../../src/utils';

describe(MochaTestRunner.name, () => {
  let MochaStub: sinon.SinonStub;
  let mocha: sinon.SinonStubbedInstance<Mocha> & { suite: sinon.SinonStubbedInstance<EventEmitter> };
  let sut: MochaTestRunner;
  let requireStub: sinon.SinonStub;
  let handleFilesStub: sinon.SinonStub;
  let handleRequiresStub: sinon.SinonStub;
  let loadRootHooks: sinon.SinonStub;

  beforeEach(() => {
    MochaStub = sinon.stub(LibWrapper, 'Mocha');
    requireStub = sinon.stub(LibWrapper, 'require');
    handleFilesStub = sinon.stub(LibWrapper, 'handleFiles');
    handleRequiresStub = sinon.stub(LibWrapper, 'handleRequires');
    loadRootHooks = sinon.stub(LibWrapper, 'loadRootHooks');
    sinon.stub(utils, 'evalGlobal');
    mocha = sinon.createStubInstance(Mocha) as any;
    mocha.suite = sinon.createStubInstance(EventEmitter) as Mocha.Suite & sinon.SinonStubbedInstance<EventEmitter>;
    MochaStub.returns(mocha);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete require.cache['baz.js'];
    delete StrykerMochaReporter.log;
  });

  function createSut(mochaSettings: Partial<{ fileNames: readonly string[]; mochaOptions: Partial<MochaOptions> }>) {
    testInjector.options.mochaOptions = mochaSettings.mochaOptions || {};
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, mochaSettings.fileNames || ['src/math.js', 'test/mathSpec.js'])
      .injectClass(MochaTestRunner);
  }

  it('should set the static `log` property on StrykerMochaReporter', () => {
    createSut({});
    expect(StrykerMochaReporter.log).eq(testInjector.logger);
  });

  describe('when mocha version < 6', () => {
    let multimatchStub: sinon.SinonStub;

    beforeEach(() => {
      handleFilesStub.value(undefined);
      multimatchStub = sinon.stub(LibWrapper, 'multimatch');
    });

    it('should log about mocha < 6 detection', async () => {
      sut = createSut({});
      multimatchStub.returns(['foo.js']);
      await sut.init();
      expect(testInjector.logger.debug).calledWith('Mocha < 6 detected. Using custom logic to discover files');
    });

    it('should add discovered test files on run() ', async () => {
      multimatchStub.returns(['foo.js', 'bar.js', 'foo2.js']);
      sut = createSut({});
      await sut.init();
      await actRun();
      expect(mocha.addFile).calledThrice;
      expect(mocha.addFile).calledWith('foo.js');
      expect(mocha.addFile).calledWith('foo2.js');
      expect(mocha.addFile).calledWith('bar.js');
    });

    it('should support both `files` as `spec`', async () => {
      multimatchStub.returns(['foo.js']);
      sut = createSut({
        fileNames: ['foo'],
        mochaOptions: {
          files: ['bar'],
          spec: ['foo'],
        },
      });
      await sut.init();
      await actRun();
      expect(multimatchStub).calledWith(['foo'], [path.resolve('foo'), path.resolve('bar')]);
    });

    it('should match given file names with configured mocha files as `array`', () => {
      const relativeGlobPatterns = ['*.js', 'baz.js'];
      const expectedGlobPatterns = relativeGlobPatterns.map((glob) => path.resolve(glob));
      actAssertMatchedPatterns(relativeGlobPatterns, expectedGlobPatterns);
    });

    it('should match given file names with configured mocha files as `string`', () => {
      const relativeGlobPattern = '*.js';
      const expectedGlobPatterns = [path.resolve(relativeGlobPattern)];
      actAssertMatchedPatterns(relativeGlobPattern, expectedGlobPatterns);
    });

    it('should match given file names with default mocha pattern "test/**/*.js"', () => {
      const expectedGlobPatterns = [path.resolve('test/**/*.js')];
      actAssertMatchedPatterns(undefined, expectedGlobPatterns);
    });

    it('should reject if no files could be discovered', async () => {
      // Arrange
      multimatchStub.returns([]);
      const files = ['foo.js', 'bar.js'];
      const relativeGlobbing = JSON.stringify(['test/**/*.js'], null, 2);
      const absoluteGlobbing = JSON.stringify([path.resolve('test/**/*.js')], null, 2);
      const filesStringified = JSON.stringify(files, null, 2);

      // Act
      sut = createSut({ fileNames: files });
      const onGoingWork = sut.init();

      // Assert
      await expect(onGoingWork).rejectedWith(
        `[MochaTestRunner] No files discovered (tried pattern(s) ${relativeGlobbing}). Please specify the files (glob patterns) containing your tests in mochaOptions.spec in your config file.`
      );
      expect(testInjector.logger.debug).calledWith(`Tried ${absoluteGlobbing} on files: ${filesStringified}.`);
    });

    function actAssertMatchedPatterns(relativeGlobPatterns: string | string[] | undefined, expectedGlobPatterns: string[]) {
      const expectedFiles = ['foo.js', 'bar.js'];
      multimatchStub.returns(['foo.js']);
      sut = createSut({ fileNames: expectedFiles, mochaOptions: { files: relativeGlobPatterns } });
      sut.init();
      expect(multimatchStub).calledWith(expectedFiles, expectedGlobPatterns);
    }
  });

  describe('when mocha version >= 6', () => {
    let discoveredFiles: string[];

    beforeEach(() => {
      discoveredFiles = [];
      handleFilesStub.returns(discoveredFiles);
    });

    it('should log about mocha >= 6 detection', async () => {
      sut = createSut({});
      await sut.init();
      expect(testInjector.logger.debug).calledWith("Mocha >= 6 detected. Using mocha's `handleFiles` to load files");
    });

    it('should mock away the `process.exit` method when calling the mocha function (unfortunate side effect)', async () => {
      sut = createSut({});
      const originalProcessExit = process.exit;
      let stubbedProcessExit = process.exit;
      handleFilesStub.callsFake(() => (stubbedProcessExit = process.exit));
      await sut.init();
      expect(originalProcessExit, "Process.exit doesn't seem to be stubbed away").not.eq(stubbedProcessExit);
      expect(originalProcessExit, "Process.exit doesn't seem to be reset").eq(process.exit);
    });

    it('should pass along supported options to mocha', async () => {
      // Arrange
      discoveredFiles.push('foo.js', 'bar.js', 'foo2.js');
      const mochaOptions: Partial<MochaOptions> = {
        ['async-only']: true,
        grep: 'grepme',
        opts: 'opts',
        require: [],
        timeout: 2000,
        ui: 'assert',
      };
      sut = createSut({ mochaOptions });
      await sut.init();

      // Act
      await actRun();

      // Assert
      expect(mocha.asyncOnly).called;
      expect(mocha.timeout).calledWith(2000);
      expect(mocha.ui).calledWith('assert');
      expect(mocha.grep).calledWith('grepme');
    });

    it("should don't set asyncOnly if asyncOnly is false", async () => {
      // Arrange
      const mochaOptions: Partial<MochaOptions> = {
        ['async-only']: false,
      };
      sut = createSut({ mochaOptions });
      await sut.init();

      // Act
      await actRun();

      // Assert
      expect(mocha.asyncOnly).not.called;
    });

    it('should pass require additional require options when constructed', async () => {
      handleRequiresStub.value(undefined);
      const mochaOptions: Partial<MochaOptions> = { require: ['ts-node', 'babel-register'] };
      sut = createSut({ mochaOptions });
      await sut.init();
      expect(requireStub).calledTwice;
      expect(requireStub).calledWith('ts-node');
      expect(requireStub).calledWith('babel-register');
    });

    it('should pass and resolve relative require options when constructed', async () => {
      handleRequiresStub.value(undefined);
      const mochaOptions: Partial<MochaOptions> = { require: ['./setup.js', 'babel-register'] };
      sut = createSut({ mochaOptions });
      await sut.init();
      const resolvedRequire = path.resolve('./setup.js');
      expect(requireStub).calledTwice;
      expect(requireStub).calledWith(resolvedRequire);
      expect(requireStub).calledWith('babel-register');
    });

    it('should evaluate additional testHooks if required (in global mocha context)', async () => {
      discoveredFiles.push('');
      sut = createSut({});
      await sut.init();
      await actRun({ timeout: 0, testHooks: 'foobar();' });
      expect(utils.evalGlobal).calledWith('foobar();');
      expect(mocha.suite.emit).calledWith('pre-require', global, '', mocha);
      expect(mocha.suite.emit).calledWith('require', undefined, '', mocha);
      expect(mocha.suite.emit).calledWith('post-require', global, '', mocha);
    });

    it('should purge cached sandbox files', async () => {
      // Arrange
      sut = createSut({ fileNames: ['foo.js', 'bar.js'] });
      discoveredFiles.push('foo.js'); // should still purge 'bar.js'
      sut.init();
      require.cache['foo.js'] = 'foo' as any;
      require.cache['bar.js'] = 'bar' as any;
      require.cache['baz.js'] = 'baz' as any;

      // Act
      await actRun();

      // Assert
      expect(require.cache['foo.js']).undefined;
      expect(require.cache['bar.js']).undefined;
      expect(require.cache['baz.js']).eq('baz');
    });
  });

  describe('when mocha version >=8', () => {
    beforeEach(() => {
      handleFilesStub.returns(['src/math.js', 'test/math.spec.js']);
    });

    it('should handle require and allow for rootHooks', async () => {
      handleRequiresStub.resolves(['root-hook1', 'bar-hook']);
      const mochaOptions: Partial<MochaOptions> = { require: ['./setup.js', 'babel-register'] };
      sut = createSut({ mochaOptions });
      await sut.init();
      expect(handleRequiresStub).calledWithExactly(['./setup.js', 'babel-register']);
      expect(loadRootHooks).calledWithExactly(['root-hook1', 'bar-hook']);
    });

    it('should pass rootHooks to the mocha instance', async () => {
      handleRequiresStub.resolves(['root-hook1', 'bar-hook']);
      const rootHooks = { beforeEach() {} };
      loadRootHooks.resolves(rootHooks);
      const mochaOptions: Partial<MochaOptions> = { require: ['./setup.js', 'babel-register'] };
      sut = createSut({ mochaOptions });
      await sut.init();
      await actRun();
      expect(LibWrapper.Mocha).calledWithMatch({ rootHooks });
    });
  });

  async function actRun(options: RunOptions = { timeout: 0 }) {
    mocha.run.callsArg(0);
    return sut.run(options);
  }
});
