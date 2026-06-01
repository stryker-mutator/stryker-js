import { StrykerOptions } from '@stryker-mutator/api/core';

import { StrykerNodeTestRunnerOptions } from '../src-generated/node-test-runner-options.js';

export interface NodeTestRunnerOptionsWithStrykerOptions
  extends StrykerNodeTestRunnerOptions, StrykerOptions {}
