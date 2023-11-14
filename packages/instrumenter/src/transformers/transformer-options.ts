import { Ignorer } from '@stryker-mutator/api/ignore';

import { MutatorOptions } from '../mutators/index.js';
import { RunLevelOptions } from '../mutators/mutation-level-options.js';

export interface TransformerOptions extends MutatorOptions, RunLevelOptions {
  ignorers: Ignorer[];
}
