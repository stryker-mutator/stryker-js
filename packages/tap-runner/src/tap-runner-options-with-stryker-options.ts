import { StrykerOptions } from '@stryker-mutator/api/core';

import { TapRunnerOptions } from '../src-generated/tap-runner-options.js';

export interface TapRunnerOptionsWithStrykerOptions extends TapRunnerOptions, StrykerOptions {}
