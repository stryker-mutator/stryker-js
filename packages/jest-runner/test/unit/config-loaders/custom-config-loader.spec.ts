import fs from 'fs';
import path from 'path';

import { factory } from '@stryker-mutator/test-helpers';
import { assert, expect } from 'chai';
import sinon from 'sinon';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader';

describe(CustomJestConfigLoader.name, () => {
  let defaultConfigLoader: CustomJestConfigLoader;
  const projectRoot = '/path/to/project/root';
  let readFileSyncStub: sinon.SinonStub;
  let requireStub: sinon.SinonStub;

  beforeEach(() => {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    requireStub = sinon.stub();

    readFileSyncStub.returns('{ "jest": { "exampleProperty": "examplePackageJsonValue" }}');
    requireStub.returns({ exampleProperty: 'exampleJestConfigValue' });

    defaultConfigLoader = new CustomJestConfigLoader(factory.logger(), factory.strykerOptions(), requireStub, projectRoot);
  });

  it('should load the Jest configuration from the jest.config.js in the project root', () => {
    const config = defaultConfigLoader.loadConfig();

    expect(requireStub).calledWith(path.join(projectRoot, 'jest.config.js'));
    expect(config).to.deep.equal({
      exampleProperty: 'exampleJestConfigValue',
    });
  });

  it('should fallback and load the Jest configuration from the package.json when jest.config.js is not present in the project', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    const config = defaultConfigLoader.loadConfig();

    assert(readFileSyncStub.calledWith(path.join(projectRoot, 'package.json'), 'utf8'), `readFileSync not called with ${projectRoot}/package.json`);
    expect(config).to.deep.equal({
      exampleProperty: 'examplePackageJsonValue',
    });
  });

  it('should load the default Jest configuration if there is no package.json config or jest.config.js', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    readFileSyncStub.returns('{ }'); // note, no `jest` key here!
    const config = defaultConfigLoader.loadConfig();
    expect(config).to.deep.equal({});
  });
});
