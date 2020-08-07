import { File } from '@stryker-mutator/api/core';

/**
 * A preprocessor changes files before writing them to the sandbox.
 * Stuff like rewriting references tsconfig.json files or adding // @ts-nocheck
 * This is a private api that we might want to open up in the future.
 */
export interface FilePreprocessor {
  preprocess(files: File[]): Promise<File[]>;
}
