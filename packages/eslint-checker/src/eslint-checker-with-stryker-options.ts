import { StrykerOptions } from '@stryker-mutator/api/core';

import { LintCheckerOptions } from '../src-generated/eslint-checker-options.js';

export interface ESlintCheckerWithStrykerOptions extends StrykerOptions, LintCheckerOptions {}
