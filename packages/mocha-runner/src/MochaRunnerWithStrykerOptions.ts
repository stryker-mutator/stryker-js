import { StrykerOptions } from '@stryker-mutator/api/core';

import { MochaRunnerOptions } from '../src-generated/mocha-runner-options';

export interface MochaRunnerWithStrykerOptions extends StrykerOptions, MochaRunnerOptions {}
