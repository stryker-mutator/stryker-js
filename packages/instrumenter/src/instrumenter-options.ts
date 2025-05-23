import { ParserOptions } from './parsers/index.js';
import { TransformerOptions } from './transformers/index.js';

export interface InstrumenterOptions
  extends ParserOptions,
    TransformerOptions {}
