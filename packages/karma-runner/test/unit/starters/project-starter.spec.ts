import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { KarmaRunnerOptionsWithStrykerOptions } from '../../../src/karma-runner-options-with-stryker-options.js';
import { AngularProjectStarter } from '../../../src/starters/angular-starter.js';
import { karmaConfigStarter } from '../../../src/starters/karma-starter.js';
import { createProjectStarter } from '../../../src/starters/project-starter.js';

describe(createProjectStarter.name, () => {
  it('should return an angular project starter when project type = "angular-cli"', () => {
    const options = testInjector.options as KarmaRunnerOptionsWithStrykerOptions;
    options.karma = {
      projectType: 'angular-cli',
    };
    const projectStarter = testInjector.injector.injectFunction(createProjectStarter);
    expect(projectStarter).instanceOf(AngularProjectStarter);
  });
  it('should return the normal karma project starter when project type = "custom"', () => {
    const options = testInjector.options as KarmaRunnerOptionsWithStrykerOptions;
    options.karma = {
      projectType: 'custom',
    };
    const projectStarter = testInjector.injector.injectFunction(createProjectStarter);
    expect(projectStarter).eq(karmaConfigStarter);
  });
});
