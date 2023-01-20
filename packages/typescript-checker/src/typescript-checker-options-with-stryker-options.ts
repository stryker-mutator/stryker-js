import { StrykerOptions } from '@stryker-mutator/api/core';

import { TypeScriptCheckerPluginOptions } from '../src-generated/typescript-checker-options';

export interface TypeScriptCheckerOptionsWithStrykerOptions extends TypeScriptCheckerPluginOptions, StrykerOptions {}
