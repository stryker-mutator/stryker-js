import { StrykerOptions } from '@stryker-mutator/api/core';

import { StrykerTapRunnerOptions } from '../src-generated/tap-runner-options.js';

export interface TapRunnerOptionsWithStrykerOptions
  extends StrykerTapRunnerOptions, StrykerOptions {}
