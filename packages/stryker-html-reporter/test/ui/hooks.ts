import HtmlReporter from '../../src/HtmlReporter';
const exampleMutations = require('../integration/exampleMutations.json');
const exampleSourceFiles = require('../integration/exampleSourceFiles.json');

before(() => {
  let reporter = new HtmlReporter({ baseDir: 'c:\\z\\github\\stryker-mutator\\stryker\\testResources\\sampleProject' });
  reporter.onAllSourceFilesRead(exampleSourceFiles);
  reporter.onAllMutantsTested(exampleMutations);
  browser.ignoreSynchronization = true;
  return reporter.wrapUp();
});
