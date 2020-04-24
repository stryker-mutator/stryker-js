import { StrykerOptions } from '@stryker-mutator/api/core';

import { TypescriptOptions } from '../src-generated/typescript-options';

export interface TypescriptWithStrykerOptions extends TypescriptOptions, StrykerOptions {}
