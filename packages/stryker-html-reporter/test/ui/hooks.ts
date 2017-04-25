import HtmlReporter from '../../src/HtmlReporter';
import * as path from 'path';
import { MutantResult, SourceFile } from 'stryker-api/report';
import { browser } from 'protractor';


const exampleMutations = (require('../integration/exampleMutations.json') as MutantResult[]).map(mutantResult => {
  while (mutantResult.sourceFilePath.indexOf('/') !== -1) {
    mutantResult.sourceFilePath = mutantResult.sourceFilePath.replace('/', path.sep);
  }
  return mutantResult;
});
const exampleSourceFiles = (require('../integration/exampleSourceFiles.json') as SourceFile[]).map(file => {
  while (file.path.indexOf('/') !== -1) {
    file.path = file.path.replace('/', path.sep);
  }
  return file;
});

before(() => {
  let reporter = new HtmlReporter({ baseDir: 'sampleProject' });
  reporter.onAllSourceFilesRead(exampleSourceFiles);
  reporter.onAllMutantsTested(exampleMutations);
  browser.ignoreSynchronization = true;
  return reporter.wrapUp();
});