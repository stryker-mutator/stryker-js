import { StrykerOptions } from '@stryker-mutator/api/core';

import { TypeScriptCheckerOptions } from '../src-generated/typescript-checker-options';

export interface TypeScriptCheckerOptionsWithStrykerOptions extends TypeScriptCheckerOptions, StrykerOptions {}
