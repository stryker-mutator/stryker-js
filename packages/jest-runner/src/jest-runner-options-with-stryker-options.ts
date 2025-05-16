import { StrykerOptions } from '@stryker-mutator/api/core';

import { JestRunnerOptions } from '../src-generated/jest-runner-options.js';

export interface JestRunnerOptionsWithStrykerOptions
  extends StrykerOptions,
    JestRunnerOptions {}
