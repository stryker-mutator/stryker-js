import * as path from 'path';
import { EventEmitter } from 'events';
import * as Mocha from 'mocha';
import * as logging from 'stryker-api/logging';
import { expect } from 'chai';
import { RunOptions } from 'stryker-api/test_runner';
import MochaTestRunner from '../../src/MochaTestRunner';
import LibWrapper from '../../src/LibWrapper';
import * as utils from '../../src/utils';
import { Mock, mock, logger, runnerOptions } from '../helpers/mockHelpers';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';

describe('MochaTestRunner', () => {

  let MochaStub: sinon.SinonStub;
  let mocha: Mock<Mocha> & { suite: Mock<EventEmitter> };
  let sut: MochaTestRunner;
  let requireStub: sinon.SinonStub;
  let multimatchStub: sinon.SinonStub;
  let log: Mock<logging.Logger>;

  beforeEach(() => {
    MochaStub = sandbox.stub(LibWrapper, 'Mocha');
    requireStub = sandbox.stub(LibWrapper, 'require');
    multimatchStub = sandbox.stub(LibWrapper, 'multimatch');
    sandbox.stub(utils, 'evalGlobal');
    mocha = mock(Mocha) as any;
    mocha.suite = mock(EventEmitter);
    MochaStub.returns(mocha);
    log = logger();
    sandbox.stub(logging, 'getLogger').returns(log);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete require.cache['baz.js'];
  });

  it('should should add all mocha test files on run()', async () => {
    multimatchStub.returns(['foo.js', 'bar.js', 'foo2.js']);
    sut = new MochaTestRunner(runnerOptions({
      strykerOptions: { mochaOptions: {} }
    }));
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
      require: [],
      asyncOnly: true,
      opts: 'opts',
      timeout: 2000,
      ui: 'assert'
    };
    sut = new MochaTestRunner(runnerOptions({ strykerOptions: { mochaOptions } }));
    await sut.init();

    // Act
    await actRun();

    // Assert
    expect(mocha.asyncOnly).calledWith(true);
    expect(mocha.timeout).calledWith(2000);
    expect(mocha.ui).calledWith('assert');
  });

  it('should pass require additional require options when constructed', () => {
    const mochaOptions: MochaRunnerOptions = { require: ['ts-node', 'babel-register'] };
    new MochaTestRunner(runnerOptions({ strykerOptions: { mochaOptions } }));
    expect(requireStub).calledTwice;
    expect(requireStub).calledWith('ts-node');
    expect(requireStub).calledWith('babel-register');
  });

  it('should evaluate additional testHooks if required (in global mocha context)', async () => {
    multimatchStub.returns(['']);
    sut = new MochaTestRunner(runnerOptions());
    await sut.init();
    await actRun({ timeout: 0, testHooks: 'foobar();' });
    expect(utils.evalGlobal).calledWith('foobar();');
    expect(mocha.suite.emit).calledWith('pre-require', global, '', mocha);
    expect(mocha.suite.emit).calledWith('require', undefined, '', mocha);
    expect(mocha.suite.emit).calledWith('post-require', global, '', mocha);
  });

  it('should purge cached sandbox files', async () => {
    // Arrange
    sut = new MochaTestRunner(runnerOptions({ fileNames: ['foo.js', 'bar.js'] }));
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
    sut = new MochaTestRunner(runnerOptions({ fileNames: files }));
    const actFn = () => sut.init();
    
    // Assert
    expect(actFn).throws(`[MochaTestRunner] No files discovered (tried pattern(s) ${relativeGlobbing
    }). Please specify the files (glob patterns) containing your tests in mochaOptions.files in your stryker.conf.js file.`);
    expect(log.debug).calledWith(`Tried ${absoluteGlobbing} on files: ${filesStringified}.`);
  });

  async function actRun(options: RunOptions = { timeout: 0 }) {
    mocha.run.callsArg(0);
    return sut.run(options);
  }

  function actAssertMatchedPatterns(relativeGlobPatterns: string | string[] | undefined, expectedGlobPatterns: string[]) {
    const expectedFiles = ['foo.js', 'bar.js'];
    multimatchStub.returns(['foo.js']);
    sut = new MochaTestRunner(runnerOptions({
      strykerOptions: { mochaOptions: { files: relativeGlobPatterns } },
      fileNames: expectedFiles
    }));
    sut.init();
    expect(multimatchStub).calledWith(expectedFiles, expectedGlobPatterns);
  }
  
});

