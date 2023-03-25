import { StrykerOptions } from '@stryker-mutator/api/core';

import { CucumberRunnerOptions } from '../src-generated/cucumber-runner-options.js';

export interface CucumberRunnerWithStrykerOptions
  extends StrykerOptions,
    CucumberRunnerOptions {}
