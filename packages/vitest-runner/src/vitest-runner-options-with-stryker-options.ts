import { StrykerOptions } from '@stryker-mutator/api/core';

import { VitestRunnerOptions } from '../src-generated/vitest-runner-options.js';

export interface VitestRunnerOptionsWithStrykerOptions extends VitestRunnerOptions, StrykerOptions {}
