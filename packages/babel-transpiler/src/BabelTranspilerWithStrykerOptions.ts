import { StrykerOptions } from '@stryker-mutator/api/core';

import { BabelTranspilerOptions } from '../src-generated/babel-transpiler-options';

export interface BabelTranspilerWithStrykerOptions extends BabelTranspilerOptions, StrykerOptions {}
