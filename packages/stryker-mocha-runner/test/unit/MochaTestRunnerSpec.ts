import * as path from 'path';
import { EventEmitter } from 'events';
import * as Mocha from 'mocha';
import { expect } from 'chai';
import { RunOptions } from 'stryker-api/test_runner';
import MochaTestRunner from '../../src/MochaTestRunner';
import LibWrapper from '../../src/LibWrapper';
import * as utils from '../../src/utils';
import { Mock, mock } from '../helpers/mockHelpers';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';
import { testInjector } from '../../../stryker-test-helpers/src';
import sinon = require('sinon');
import { commonTokens } from 'stryker-api/plugin';

describe.only(MochaTestRunner.name, () => {

  let MochaStub: sinon.SinonStub;
  let mocha: Mock<Mocha> & { suite: Mock<EventEmitter> };
  let sut: MochaTestRunner;
  let requireStub: sinon.SinonStub;
  let multimatchStub: sinon.SinonStub;

  beforeEach(() => {
    MochaStub = sinon.stub(LibWrapper, 'Mocha');
    requireStub = sinon.stub(LibWrapper, 'require');
    multimatchStub = sinon.stub(LibWrapper, 'multimatch');
    sinon.stub(utils, 'evalGlobal');
    mocha = mock(Mocha) as any;
    mocha.suite = mock(EventEmitter);
    MochaStub.returns(mocha);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete require.cache['baz.js'];
  });

  function createSut(mochaSettings: Partial<{ fileNames: ReadonlyArray<string>, mochaOptions: MochaRunnerOptions }>) {
    testInjector.options.mochaOptions = mochaSettings.mochaOptions || {};
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, mochaSettings.fileNames || ['src/math.js', 'test/mathSpec.js'])
      .injectClass(MochaTestRunner);
  }

  it('should should add all mocha test files on run()', async () => {
    multimatchStub.returns(['foo.js', 'bar.js', 'foo2.js']);
    sut = createSut({});
    await sut.init();
    await actRun();
    expect(mocha.addFile).calledThrice;
    expect(mocha.addFile).calledWith('foo.js');
    expect(mocha.addFile).calledWith('foo2.js');
    expect(mocha.addFile).calledWith('bar.js');
  });

  it('should match given file names with configured mocha files as `array`', () => {
    const relativeGlobPatterns = ['*.js', 'baz.js'];
    const expectedGlobPatterns = relativeGlobPatterns.map(glob => path.resolve(glob));
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

  it('should pass along supported options to mocha', async () => {
    // Arrange
    multimatchStub.returns(['foo.js', 'bar.js', 'foo2.js']);
    const mochaOptions: MochaRunnerOptions = {
      asyncOnly: true,
      grep: /grepme/,
      opts: 'opts',
      require: [],
      timeout: 2000,
      ui: 'assert'
    };
    sut = createSut({ mochaOptions });
    await sut.init();

    // Act
    await actRun();

    // Assert
    expect(mocha.asyncOnly).calledWith(true);
    expect(mocha.timeout).calledWith(2000);
    expect(mocha.ui).calledWith('assert');
    expect(mocha.grep).calledWith(/grepme/);
  });

  it('should pass require additional require options when constructed', () => {
    const mochaOptions: MochaRunnerOptions = { require: ['ts-node', 'babel-register'] };
    createSut({ mochaOptions });
    expect(requireStub).calledTwice;
    expect(requireStub).calledWith('ts-node');
    expect(requireStub).calledWith('babel-register');
  });

  it('should pass and resolve relative require options when constructed', () => {
    const mochaOptions: MochaRunnerOptions = { require: ['./setup.js', 'babel-register'] };
    createSut({ mochaOptions });
    const resolvedRequire = path.resolve('./setup.js');
    expect(requireStub).calledTwice;
    expect(requireStub).calledWith(resolvedRequire);
    expect(requireStub).calledWith('babel-register');
  });

  it('should evaluate additional testHooks if required (in global mocha context)', async () => {
    multimatchStub.returns(['']);
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
    multimatchStub.returns(['foo.js']); // should still purge 'bar.js'
    sut.init();
    require.cache['foo.js'] = 'foo';
    require.cache['bar.js'] = 'bar';
    require.cache['baz.js'] = 'baz';

    // Act
    await actRun();

    // Assert
    expect(require.cache['foo.js']).undefined;
    expect(require.cache['bar.js']).undefined;
    expect(require.cache['baz.js']).eq('baz');
  });

  it('should throw an error if no files could be discovered', () => {
    // Arrange
    multimatchStub.returns([]);
    const files = ['foo.js', 'bar.js'];
    const relativeGlobbing = JSON.stringify(['test/**/*.js'], null, 2);
    const absoluteGlobbing = JSON.stringify([path.resolve('test/**/*.js')], null, 2);
    const filesStringified = JSON.stringify(files, null, 2);

    // Act
    sut = createSut({ fileNames: files });
    const actFn = () => sut.init();

    // Assert
    expect(actFn).throws(`[MochaTestRunner] No files discovered (tried pattern(s) ${relativeGlobbing
      }). Please specify the files (glob patterns) containing your tests in mochaOptions.files in your stryker.conf.js file.`);
    expect(testInjector.logger.debug).calledWith(`Tried ${absoluteGlobbing} on files: ${filesStringified}.`);
  });

  async function actRun(options: RunOptions = { timeout: 0 }) {
    mocha.run.callsArg(0);
    return sut.run(options);
  }

  function actAssertMatchedPatterns(relativeGlobPatterns: string | string[] | undefined, expectedGlobPatterns: string[]) {
    const expectedFiles = ['foo.js', 'bar.js'];
    multimatchStub.returns(['foo.js']);
    sut = createSut({ fileNames: expectedFiles, mochaOptions: { files: relativeGlobPatterns } });
    sut.init();
    expect(multimatchStub).calledWith(expectedFiles, expectedGlobPatterns);
  }

});
