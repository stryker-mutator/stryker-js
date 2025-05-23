import { StrykerOptions } from '@stryker-mutator/api/core';
import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import { requireResolve } from '@stryker-mutator/util';

import { KarmaRunnerOptionsWithStrykerOptions } from '../karma-runner-options-with-stryker-options.js';
import { pluginTokens } from '../plugin-tokens.js';

import { AngularProjectStarter } from './angular-starter.js';
import { karmaConfigStarter } from './karma-starter.js';
import { StartedProject } from './started-project.js';

export interface ProjectStarter {
  start(): Promise<StartedProject>;
}

createProjectStarter.inject = tokens(
  commonTokens.options,
  commonTokens.injector,
);
export function createProjectStarter(
  options: StrykerOptions,
  injector: Injector<PluginContext>,
): ProjectStarter {
  const actualOptions = options as KarmaRunnerOptionsWithStrykerOptions;
  if (actualOptions.karma.projectType === 'angular-cli') {
    return injector
      .provideValue(pluginTokens.requireResolve, requireResolve)
      .injectClass(AngularProjectStarter);
  } else {
    return karmaConfigStarter;
  }
}
