import DefaultJestConfigLoader from '../../../src/configLoaders/DefaultJestConfigLoader';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

const fakeRequire: any = {
  require: () => { }
};

describe('DefaultJestConfigLoader', () => {
  let defaultConfigLoader: DefaultJestConfigLoader;
  let projectRoot: string = '/path/to/project/root';
  let fsStub: FsStub = {};
  let requireStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    fsStub.readFileSync = sandbox.stub(fs, 'readFileSync');
    requireStub = sandbox.stub(fakeRequire, 'require');

    fsStub.readFileSync.returns('{ "jest": { "exampleProperty": "examplePackageJsonValue" }}');
    requireStub.returns({ exampleProperty: 'exampleJestConfigValue' });

    defaultConfigLoader = new DefaultJestConfigLoader(projectRoot, fs, fakeRequire.require);
  });

  afterEach(() => sandbox.restore());

  it('should load the Jest configuration from the jest.config.js in the projectroot', () => {
    const config = defaultConfigLoader.loadConfig();

    assert(requireStub.calledWith(path.join(projectRoot, 'jest.config.js')), `loader not called with ${projectRoot}/jest.config.js`);
    expect(config).to.deep.equal({
      exampleProperty: 'exampleJestConfigValue'
    });
  });

  it('should return an error when no Jest configuration is present in neither jest.config.js or package.json', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open jest.config.js'));
    fsStub.readFileSync.returns('{ "name": "dummy", "version": "0.0.1", "description": "Dummy package.json without jest property"}');

    expect(() => defaultConfigLoader.loadConfig()).to.throw(Error, 'Could not read Jest configuration, please provide a jest.config.js file or a jest config in your package.json');
  });

  it('should fallback and load the Jest configuration from the package.json when jest.config.js is not present in the project', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    const config = defaultConfigLoader.loadConfig();

    assert(fsStub.readFileSync.calledWith(path.join(projectRoot, 'package.json'), 'utf8'), `readFileSync not called with ${projectRoot}/package.json`);
    expect(config).to.deep.equal({
      exampleProperty: 'examplePackageJsonValue'
    });
  });
});

interface FsStub {
  [key: string]: sinon.SinonStub;
}