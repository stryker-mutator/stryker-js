import { StrykerOptions } from '@stryker-mutator/api/core';

import { TypescriptCheckerOptions } from '../src-generated/typescript-checker-options';

export interface TypescriptCheckerWithStrykerOptions extends StrykerOptions, TypescriptCheckerOptions {}
