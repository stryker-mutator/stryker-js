import { Ignorer } from '@stryker-mutator/api/ignorer';

import { MutatorOptions } from '../mutators/index.js';

export interface TransformerOptions extends MutatorOptions {
  ignorers: Ignorer[];
}
