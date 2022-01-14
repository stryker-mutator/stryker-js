import path from 'path';

import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import sinon from 'sinon';

import { createTypescriptChecker } from '../../src';
import { TypescriptChecker } from '../../src/typescript-checker';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'no-files-project'
) as unknown as typeof path.resolve;

describe('Typescript checker on a project without files', () => {
  let sut: TypescriptChecker;

  before(() => {
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.settings.json');
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    (sut as any).tsCompiler = {
      init: sinon.stub(),
    };
  });

  it('should throw an error when there are no sourceFiles', async () => {
    (sut as any).tsCompiler.init.resolves({ dependencyFiles: [], errors: [] });

    expect(sut.init()).rejectedWith(new Error('No sourcefiles were loaded in the compiler.'));
  });
});
