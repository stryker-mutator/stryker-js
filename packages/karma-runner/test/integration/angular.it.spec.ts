import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { KarmaTestRunner } from '../../src/karma-test-runner';
import { KarmaRunnerOptionsWithStrykerOptions } from '../../src/karma-runner-options-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe(`${KarmaTestRunner.name} on using projectType angular`, () => {
  it('should reject when no angular cli is available', async () => {
    (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
      projectType: 'angular-cli',
      configFile: resolveTestResource('sampleProject', 'karma-jasmine.conf.js'),
    };
    const sut = testInjector.injector.injectClass(KarmaTestRunner);
    await expect(sut.init()).rejectedWith("Cannot find module '@angular/cli");
  });

  // Other tests are done in e2e testing 🤷‍♀️
});
