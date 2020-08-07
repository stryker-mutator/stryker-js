import { File } from '@stryker-mutator/api/core';

import { FilePreprocessor } from './file-preprocessor';

export class MultiPreprocessor implements FilePreprocessor {
  constructor(private readonly preprocessors: FilePreprocessor[]) {}

  public async preprocess(files: File[]): Promise<File[]> {
    for await (const preprocessor of this.preprocessors) {
      files = await preprocessor.preprocess(files);
    }
    return files;
  }
}
