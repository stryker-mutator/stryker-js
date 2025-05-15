import { StrykerOptions } from '@stryker-mutator/api/core';

import { KarmaRunnerOptions } from '../src-generated/karma-runner-options.js';

export interface KarmaRunnerOptionsWithStrykerOptions
  extends KarmaRunnerOptions,
    StrykerOptions {}
