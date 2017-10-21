import * as path from 'path';
import * as fs from 'fs';
import { Config } from 'stryker-api/config';
import MochaConfigEditor from '../../src/MochaConfigEditor';
import { expect } from 'chai';
import * as log4js from 'log4js';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';
import { logger, Mock } from '../helpers/mockHelpers';

describe('MochaConfigEditor', () => {

  let readFileStub: sinon.SinonStub;
  let config: Config;
  let sut: MochaConfigEditor;
  let log: Mock<log4js.Logger>;

  beforeEach(() => {
    log = logger();
    sandbox.stub(log4js, 'getLogger').returns(log);
    readFileStub = sandbox.stub(fs, 'readFileSync');
    sut = new MochaConfigEditor();
    config = new Config();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should load a mocha.opts file if specified', () => {
    readFileStub.returns('');
    config['mochaOptions'] = {
      opts: 'some/mocha.opts/file'
    };
    sut.edit(config);
    expect(log.info).calledWith(`Loading mochaOpts from "${path.resolve('some/mocha.opts/file')}"`);
    expect(fs.readFileSync).calledWith(path.resolve('some/mocha.opts/file'));
  });

  it('should load `--require` and `-r` properties if specified in mocha.opts file', () => {
    readFileStub.returns(`
    --require  src/test/support/setup
    -r babel-require
    `);
    config['mochaOptions'] = { opts: '.' };
    sut.edit(config);
    expect(config.mochaOptions).deep.include({
      require: [
        'src/test/support/setup',
        'babel-require'
      ]
    });
  });

  function itShouldLoadProperty(property: string, value: string, expectedConfig: Partial<MochaRunnerOptions>) {
    it(`should load '${property} if specified`, () => {
      readFileStub.returns(`${property} ${value}`);
      config['mochaOptions'] = { opts: 'path/to/opts/file' };
      sut.edit(config);
      expect(config.mochaOptions).deep.include(expectedConfig);
    });
  }

  itShouldLoadProperty('--timeout', '2000', { timeout: 2000 });
  itShouldLoadProperty('-t', '2000', { timeout: 2000 });
  itShouldLoadProperty('-A', '', { asyncOnly: true });
  itShouldLoadProperty('--async-only', '', { asyncOnly: true });
  itShouldLoadProperty('--ui', 'qunit', { ui: 'qunit' });
  itShouldLoadProperty('-u', 'qunit', { ui: 'qunit' });

  it('should not override additional properties', () => {
    readFileStub.returns(`
      -u qunit
      -t 2000
      -A
      -r babel-register
    `);
    config['mochaOptions'] = {
      opts: 'path/to/opts/file',
      ui: 'exports',
      timeout: 4000,
      asyncOnly: false,
      require: ['ts-node/register']
    };
    sut.edit(config);
    expect(config.mochaOptions).deep.equal({
      opts: 'path/to/opts/file',
      ui: 'exports',
      timeout: 4000,
      asyncOnly: false,
      require: ['ts-node/register']
    });
  });

  it('should ignore additional properties', () => {
    readFileStub.returns(`
    --reporter dot
    --ignore-leaks
    `);
    config['mochaOptions'] = {
      opts: 'some/mocha.opts/file',
    };
    sut.edit(config);
    expect(config.mochaOptions).deep.eq({ opts: 'some/mocha.opts/file', require: [] });
    expect(log.debug).calledWith('Ignoring option "--reporter" as it is not supported.');
    expect(log.debug).calledWith('Ignoring option "--ignore-leaks" as it is not supported.');
  });

  it('should ignore invalid --ui and --timeout options', () => {
    readFileStub.returns(`
    --timeout
    --ui
    `);
    config['mochaOptions'] = {
      opts: 'some/mocha.opts/file',
    };
    sut.edit(config);
    expect(config.mochaOptions).deep.eq({ opts: 'some/mocha.opts/file', require: [], timeout: undefined, ui: undefined });
  });
});