import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { Vitest } from 'vitest/node';

import { VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { vitestWrapper } from '../../src/vitest-wrapper.js';
import { createVitestMock } from '../util/factories.js';

describe(VitestTestRunner.name, () => {
  let sut: VitestTestRunner;
  let createVitestStub: sinon.SinonStubbedMember<typeof vitestWrapper.createVitest>;
  let options: VitestRunnerOptionsWithStrykerOptions;
  let vitestStub: sinon.SinonStubbedInstance<Vitest>;

  beforeEach(() => {
    sut = testInjector.injector.provideValue('globalNamespace', '__stryker2__' as const).injectClass(VitestTestRunner);
    createVitestStub = sinon.stub(vitestWrapper, 'createVitest');
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = {};
    vitestStub = createVitestMock();
    createVitestStub.resolves(vitestStub);
  });

  it('should not have reload capabilities', () => {
    // The files under test are cached between runs
    const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: true };
    expect(sut.capabilities()).deep.eq(expectedCapabilities);
  });

  describe(VitestTestRunner.prototype.dispose.name, () => {
    it('should not throw when not initialized', async () => {
      await expect(sut.dispose()).not.rejected;
    });
  });

  it('should set the NODE_ENV environment variable to test in init', async () => {
    delete process.env.NODE_ENV;

    await sut.init();

    expect(process.env.NODE_ENV).to.equal('test');
  });
});
