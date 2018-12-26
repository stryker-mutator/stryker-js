import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import * as logging from 'stryker-api/logging';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';
import { logger, Mock } from '../helpers/mockHelpers';

describe('MochaOptionsLoader', () => {

  let readFileStub: sinon.SinonStub;
  let existsFileStub: sinon.SinonStub;
  let config: Config;
  let sut: MochaOptionsLoader;
  let log: Mock<logging.Logger>;

  beforeEach(() => {
    log = logger();
    sandbox.stub(logging, 'getLogger').returns(log);
    readFileStub = sandbox.stub(fs, 'readFileSync');
    existsFileStub = sandbox.stub(fs, 'existsSync').returns(true);
    sut = new MochaOptionsLoader();
    config = new Config();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should load a mocha.opts file if specified', () => {
    readFileStub.returns('');
    config.mochaOptions = {
      opts: 'some/mocha.opts/file'
    };
    sut.load(config);
    expect(log.info).calledWith(`Loading mochaOpts from "${path.resolve('some/mocha.opts/file')}"`);
    expect(fs.readFileSync).calledWith(path.resolve('some/mocha.opts/file'));
  });

  it('should log an error if specified mocha.opts file doesn\'t exist', () => {
    readFileStub.returns('');
    existsFileStub.returns(false);
    config.mochaOptions = {
      opts: 'some/mocha.opts/file'
    };

    sut.load(config);
    expect(log.error).calledWith(`Could not load opts from "${path.resolve('some/mocha.opts/file')}". Please make sure opts file exists.`);
  });

  it('should load default mocha.opts file if not specified', () => {
    readFileStub.returns('');
    sut.load(config);
    expect(log.info).calledWith(`Loading mochaOpts from "${path.resolve('test/mocha.opts')}"`);
    expect(fs.readFileSync).calledWith(path.resolve('test/mocha.opts'));
  });

  it('should not load default mocha.opts file if not found', () => {
    existsFileStub.returns(false);
    const options = sut.load(config);
    expect(options).deep.eq({});
    expect(log.debug).calledWith('No mocha opts file found, not loading additional mocha options (%s.opts was not defined).', 'mochaOptions');
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

  function itShouldLoadProperty(property: string, value: string, expectedConfig: Partial<MochaRunnerOptions>) {
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

  it('should not override additional properties', () => {
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
      opts: 'path/to/opts/file',
      require: ['ts-node/register'],
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
      opts: 'some/mocha.opts/file'
    };
    const options = sut.load(config);
    expect(options).deep.eq({ opts: 'some/mocha.opts/file' });
    expect(log.debug).calledWith('Ignoring option "--reporter" as it is not supported.');
    expect(log.debug).calledWith('Ignoring option "--ignore-leaks" as it is not supported.');
  });

  it('should ignore invalid --ui and --timeout options', () => {
    readFileStub.returns(`
    --timeout
    --ui
    `);
    config.mochaOptions = {
      opts: 'some/mocha.opts/file'
    };
    const options = sut.load(config);
    expect(options).deep.eq({ opts: 'some/mocha.opts/file', timeout: undefined, ui: undefined });
  });
});
