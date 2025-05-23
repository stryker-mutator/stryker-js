import { StrykerOptions } from '@stryker-mutator/api/core';

import { StrykerVitestRunnerOptions } from '../src-generated/vitest-runner-options.js';

export interface VitestRunnerOptionsWithStrykerOptions
  extends StrykerVitestRunnerOptions,
    StrykerOptions {}
