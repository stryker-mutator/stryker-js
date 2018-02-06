import DefaultJestConfigLoader from '../../../src/configLoaders/DefaultJestConfigLoader';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

describe('DefaultJestConfigLoader', () => {
  let defaultConfigLoader: DefaultJestConfigLoader;
  let projectRoot: string = '/path/to/project/root';
  let fsStub: FsStub = {};
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    fsStub.readFileSync = sandbox.stub(fs, 'readFileSync');

    defaultConfigLoader = new DefaultJestConfigLoader(projectRoot, fs);
  });

  afterEach(() => sandbox.restore());

  it('should load the Jest configuration from the package.json in the project', () => {
    fsStub.readFileSync.returns('{ "jest": { "exampleProperty": "exampleValue" }}');

    const config = defaultConfigLoader.loadConfig();

    assert(fsStub.readFileSync.calledWith(path.join(projectRoot, 'package.json'), 'utf8'), 'readFileSync not called with projectRoot');
    expect(config).to.deep.equal({
      exampleProperty: 'exampleValue'
    });
  });

  it('should return an error when no Jest configuration is specified in the config.json', () => {
    fsStub.readFileSync.returns('{}');

    expect(() => defaultConfigLoader.loadConfig()).to.throw(Error, 'No Jest configuration found in your package.json');
  });
});

interface FsStub {
  [key: string]: sinon.SinonStub;
}