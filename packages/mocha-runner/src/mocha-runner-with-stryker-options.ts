import { StrykerOptions } from '@stryker-mutator/api/core';

import { MochaRunnerOptions } from '../src-generated/mocha-runner-options.js';

export interface MochaRunnerWithStrykerOptions extends StrykerOptions, MochaRunnerOptions {}
