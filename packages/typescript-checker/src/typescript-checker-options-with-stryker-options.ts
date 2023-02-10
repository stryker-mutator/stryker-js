import { StrykerOptions } from '@stryker-mutator/api/core';

import { TypescriptCheckerPluginOptions } from '../src-generated/typescript-checker-options';

export interface TypescriptCheckerOptionsWithStrykerOptions extends TypescriptCheckerPluginOptions, StrykerOptions {}
