import fs from 'fs';
import path from 'path';

import { factory } from '@stryker-mutator/test-helpers';
import { assert, expect } from 'chai';
import sinon from 'sinon';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader';

describe(`${CustomJestConfigLoader.name} integration`, () => {
  let sut: CustomJestConfigLoader;
  const projectRoot = '/path/to/project/root';
  const fsStub: FsStub = {};
  let requireStub: sinon.SinonStub;

  beforeEach(() => {
    fsStub.readFileSync = sinon.stub(fs, 'readFileSync');
    requireStub = sinon.stub();

    fsStub.readFileSync.returns('{ "jest": { "exampleProperty": "examplePackageJsonValue" }}');
    requireStub.returns({ exampleProperty: 'exampleJestConfigValue' });

    sut = new CustomJestConfigLoader(factory.logger(), factory.strykerOptions(), requireStub, projectRoot);
  });

  it('should load the Jest configuration from the jest.config.js in the projectroot', () => {
    const config = sut.loadConfig();

    assert(requireStub.calledWith(path.join(projectRoot, 'jest.config.js')), `loader not called with ${projectRoot}/jest.config.js`);
    expect(config).to.deep.equal({
      exampleProperty: 'exampleJestConfigValue',
    });
  });

  it('should fallback and load the Jest configuration from the package.json when jest.config.js is not present in the project', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    const config = sut.loadConfig();

    assert(
      fsStub.readFileSync.calledWith(path.join(projectRoot, 'package.json'), 'utf8'),
      `readFileSync not called with ${projectRoot}/package.json`
    );
    expect(config).to.deep.equal({
      exampleProperty: 'examplePackageJsonValue',
    });
  });

  it('should load the default Jest configuration if there is no package.json config or jest.config.js', () => {
    requireStub.throws(Error('ENOENT: no such file or directory, open package.json'));
    fsStub.readFileSync.returns('{ }'); // note, no `jest` key here!
    const config = sut.loadConfig();
    expect(config).to.deep.equal({});
  });
});

type FsStub = Record<string, sinon.SinonStub>;
