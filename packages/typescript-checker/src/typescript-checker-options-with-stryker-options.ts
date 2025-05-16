import type { StrykerOptions } from '@stryker-mutator/api/core';

import type { TypescriptCheckerPluginOptions } from '../src-generated/typescript-checker-options.js';

export interface TypescriptCheckerOptionsWithStrykerOptions
  extends TypescriptCheckerPluginOptions,
    StrykerOptions {}
