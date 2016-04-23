import {InputFile} from './api/core';
import {glob, normalize} from './utils/fileUtils';
import * as _ from 'lodash';
import * as log4js from 'log4js';

const log = log4js.getLogger('InputFileResolver');

export default class InputFileResolver {

  constructor(private mutateFileExpressions: string[], private allFileExpressions: string[]) {
  }

  public resolve(): Promise<InputFile[]> {
    return new Promise<InputFile[]>((resolve, reject) => {
      let errors: string[] = [];

      Promise.all([InputFileResolver.resolveFileGlobs(this.mutateFileExpressions), InputFileResolver.resolveFileGlobs(this.allFileExpressions)])
        .then((files) => {
          let mutateFiles = files[0];
          let allFiles = files[1];
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
            resolve(allFiles.map(file => { return { path: file, shouldMutate: mutateFiles.some(mutateFile => mutateFile === file) }; }))
          }
        }, error => reject(error));
    });
  }


  private static reportEmptyGlobbingExpression(expression: string) {
    log.warn(`Globbing expression "${expression}" did not result in any files.`);
  }

  private static resolveFileGlobs(sourceExpressions: string[]): Promise<string[]> {
    return Promise.all(sourceExpressions.map(expression => glob(expression).then(files => {
      if (files.length === 0) {
        this.reportEmptyGlobbingExpression(expression);
      }
      return files;
    }))).then(files => _.flatten(files));
  }
}