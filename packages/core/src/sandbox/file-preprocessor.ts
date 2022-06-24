import { Project } from '../fs/project.js';

/**
 * A preprocessor changes files before writing them to the sandbox.
 * Stuff like rewriting references tsconfig.json files or adding // @ts-nocheck
 * This is a private api that we might want to open up in the future.
 */
export interface FilePreprocessor {
  preprocess(files: Project): Promise<void>;
}
