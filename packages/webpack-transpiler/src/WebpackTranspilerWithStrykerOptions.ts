import { StrykerOptions } from '@stryker-mutator/api/core';

import { WebpackTranspilerOptions } from '../src-generated/webpack-transpiler-options';

export interface WebpackTranspilerWithStrykerOptions extends WebpackTranspilerOptions, StrykerOptions {}
