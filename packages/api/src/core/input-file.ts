import { MutationRange } from './mutation-range.js';

/**
 * Input files by file name.
 */
export type InputFiles = Record<string, InputFile>;

/**
 * The metadata of a input file
 */
export interface InputFile {
  mutate: MutationRange | boolean;
}
