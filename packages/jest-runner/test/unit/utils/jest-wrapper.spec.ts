import path from 'path';

import type { requireResolve } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { determineResolveFromDirectory, JestWrapper } from '../../../src/utils/index.js';
import { createJestConfigArgv, createJestRunnerOptionsWithStrykerOptions, createJestRunResult } from '../../helpers/producers.js';

describe(determineResolveFromDirectory.name, () => {
  it('should resolve "react-scripts" when project type is "create-react-app"', () => {
    // Arrange
    const resolveStub = sinon.stub<[string], string>();
    resolveStub.returns('node_modules/react-scripts/package.json');
    const options = createJestRunnerOptionsWithStrykerOptions({ projectType: 'create-react-app' });

    // Act
    const actualDir = determineResolveFromDirectory(options, resolveStub);

    // Assert
    sinon.assert.calledOnceWithExactly(resolveStub, 'react-scripts/package.json');
    expect(actualDir).eq(path.join('node_modules', 'react-scripts'));
  });

  it('should resolve to cwd when project type is "custom"', () => {
    // Arrange
    const resolveStub = sinon.stub<[string], string>();
    const options = createJestRunnerOptionsWithStrykerOptions({ projectType: 'custom' });

    // Act
    const actualDir = determineResolveFromDirectory(options, resolveStub);

    // Assert
    sinon.assert.notCalled(resolveStub);
    expect(actualDir).eq(process.cwd());
  });
});

describe(JestWrapper.name, () => {
  let jestModuleMock: sinon.SinonStubbedInstance<JestWrapper>;
  let requireResolveStub: sinon.SinonStubbedMember<typeof requireResolve>;

  beforeEach(() => {
    jestModuleMock = sinon.createStubInstance(JestWrapper);
    requireResolveStub = sinon.stub();
    requireResolveStub.returns(jestModuleMock);
  });

  it('should resolve jest from the given directory', () => {
    new JestWrapper('foo/bar', requireResolveStub);
    sinon.assert.calledOnceWithExactly(requireResolveStub, 'jest', 'foo/bar');
  });

  it('should proxy "getVersion"', () => {
    const expectedVersion = '29.0.1';
    jestModuleMock.getVersion.returns(expectedVersion);
    const sut = new JestWrapper('', requireResolveStub);
    const actualVersion = sut.getVersion();
    expect(actualVersion).eq(expectedVersion);
  });

  it('should proxy "runCLI"', async () => {
    const expectedArgv = createJestConfigArgv({ testNamePattern: 'my-test' });
    const expectedResult = createJestRunResult();
    jestModuleMock.runCLI.resolves(expectedResult);
    const sut = new JestWrapper('', requireResolveStub);

    const actualResult = await sut.runCLI(expectedArgv, ['.']);

    sinon.assert.calledOnceWithExactly(jestModuleMock.runCLI, expectedArgv, ['.']);
    expect(actualResult).eq(expectedResult);
  });
});
