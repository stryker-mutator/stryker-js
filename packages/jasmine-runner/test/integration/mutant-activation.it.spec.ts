import { factory, assertions, testInjector, fsPromisesCp } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createJasmineTestRunnerFactory, JasmineTestRunner } from '../../src/index.js';
import { resolveTempTestResourceDirectory, resolveTestResource, resolveFromRoot } from '../helpers/resolve-test-resource.js';

describe(`${JasmineTestRunner.name} mutant activation`, () => {
  let sut: JasmineTestRunner;
  beforeEach(async () => {
    const tmpDir = resolveTempTestResourceDirectory();
    await fsPromisesCp(resolveTestResource('mutant-activation'), tmpDir, { recursive: true });
    process.chdir(tmpDir);
    testInjector.options.jasmineConfigFile = 'jasmine.json';
    sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
  });

  afterEach(async () => {
    process.chdir(resolveFromRoot());
  });

  it('should support static', async function () {
    const result = await sut.mutantRun(
      factory.mutantRunOptions({ activeMutant: factory.mutantTestCoverage({ id: '42' }), mutantActivation: 'static' })
    );
    assertions.expectKilled(result);
    expect(result.failureMessage.startsWith('Error:'), result.failureMessage).true;
    expect(JSON.parse(result.failureMessage.substring('Error:'.length))).deep.eq({ runtimeActiveMutant: '42', staticActiveMutant: '42' });
  });

  it('should support runtime', async function () {
    const result = await sut.mutantRun(
      factory.mutantRunOptions({ activeMutant: factory.mutantTestCoverage({ id: '42' }), mutantActivation: 'runtime' })
    );
    assertions.expectKilled(result);
    expect(result.failureMessage.startsWith('Error:'), result.failureMessage).true;
    expect(JSON.parse(result.failureMessage.substring('Error:'.length))).deep.eq({ runtimeActiveMutant: '42', staticActiveMutant: null });
  });
});
