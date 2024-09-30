import { Project } from '../fs/project.js';

import { FilePreprocessor } from './file-preprocessor.js';

export class MultiPreprocessor implements FilePreprocessor {
  constructor(private readonly preprocessors: FilePreprocessor[]) {}

  public async preprocess(project: Project): Promise<void> {
    for (const preprocessor of this.preprocessors) {
      await preprocessor.preprocess(project);
    }
  }
}
