import {InputFile} from './api/core';
import {glob, normalize} from './utils/fileUtils';

export default class InputFileResolver {

  constructor(private mutateFileExpressions: string[], private allFileExpressions: string[]) {
  }

  public resolve(): Promise<InputFile[]> {
    return new Promise<InputFile[]>((resolve, reject) => {
      let mutateFiles: string[] = [];
      let allFiles: string[] = [];
      let errors: string[] = [];

      Promise.all([InputFileResolver.resolveFileGlobs(this.mutateFileExpressions, mutateFiles), InputFileResolver.resolveFileGlobs(this.allFileExpressions, allFiles)])
        .then(() => {
          normalize(allFiles);
          normalize(mutateFiles);

          mutateFiles.forEach(mutateFile => {
            if (allFiles.indexOf(mutateFile) < 0) {
              errors.push(`Could not find mutate file "${mutateFile}" in list of files.`);
            }
          });
          if (errors.length > 0) {
            reject(errors);
          } else {
            resolve(allFiles.map(file => { return { path: file, shouldMutate: mutateFiles.some(mutateFile => mutateFile === file) };}))
          }
        }, error => reject(error));
    });
  }


  private static reportEmptyGlobbingExpression(expression: string) {
    console.log(`WARNING: Globbing expression "${expression}" did not result in any files.`)
  }

  private static resolveFileGlobs(sourceExpressions: string[], resultFiles: string[]): Promise<void[]> {
    return Promise.all(sourceExpressions.map((mutateFileExpression: string) => glob(mutateFileExpression).then(files => {
      if (files.length === 0) {
        this.reportEmptyGlobbingExpression(mutateFileExpression);
      }
      files.forEach(f => resultFiles.push(f));
    })));
  }
}