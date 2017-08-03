import * as path from 'path';
import { expect } from 'chai';
import * as fs from 'mz/fs';
import HtmlReporter from '../../src/HtmlReporter';
import EventPlayer from '../helpers/EventPlayer';

const REPORT_DIR = 'reports/mutation/stryker';

describe('Html report of stryker', function () {
  let sut: any;
  this.timeout(10000);

  beforeEach(() => {
    sut = new HtmlReporter({ htmlReporter: { baseDir: REPORT_DIR } });
    return new EventPlayer('testResources/strykerEvents')
      .replay(sut)
      .then(() => sut.wrapUp());
  });

  it('should build all files in the report', () => {
    expect(readDirectoryTree()).to.be.deep.equal({ 'name': 'stryker', 'directories': [{ 'name': 'bootstrap', 'directories': [{ 'name': 'css', 'directories': [], 'files': ['bootstrap-theme.css', 'bootstrap-theme.min.css', 'bootstrap.css', 'bootstrap.min.css'] }, { 'name': 'js', 'directories': [], 'files': ['bootstrap.js', 'bootstrap.min.js', 'npm.js'] }], 'files': [] }, { 'name': 'coverage', 'directories': [], 'files': ['CoverageInstrumenter.js.html', 'CoverageInstrumenterStream.js.html', 'index.html'] }, { 'name': 'highlightjs', 'directories': [{ 'name': 'styles', 'directories': [], 'files': ['default.css'] }], 'files': [] }, { 'name': 'initializer', 'directories': [], 'files': ['NpmClient.js.html', 'PromptOption.js.html', 'StrykerConfigWriter.js.html', 'StrykerInitializer.js.html', 'StrykerInquirer.js.html', 'index.html'] }, { 'name': 'isolated-runner', 'directories': [], 'files': ['IsolatedRunnerOptions.js.html', 'IsolatedTestRunnerAdapter.js.html', 'IsolatedTestRunnerAdapterFactory.js.html', 'IsolatedTestRunnerAdapterWorker.js.html', 'MessageProtocol.js.html', 'ResilientTestRunnerFactory.js.html', 'RetryDecorator.js.html', 'TestRunnerDecorator.js.html', 'TimeoutDecorator.js.html', 'index.html'] }, { 'name': 'mutators', 'directories': [], 'files': ['ArrayDeclaratorMutator.js.html', 'BinaryOperatorMutator.js.html', 'BlockStatementMutator.js.html', 'BooleanSubstitutionMutator.js.html', 'LogicalOperatorMutator.js.html', 'RemoveConditionalsMutator.js.html', 'UnaryOperatorMutator.js.html', 'UpdateOperatorMutator.js.html', 'index.html'] }, { 'name': 'reporters', 'directories': [], 'files': ['BroadcastReporter.js.html', 'ClearTextReporter.js.html', 'ClearTextScoreTable.js.html', 'DotsReporter.js.html', 'EventRecorderReporter.js.html', 'ProgressAppendOnlyReporter.js.html', 'ProgressBar.js.html', 'ProgressKeeper.js.html', 'ProgressReporter.js.html', 'StrictReporter.js.html', 'index.html'] }, { 'name': 'utils', 'directories': [], 'files': ['StrykerTempFolder.js.html', 'Task.js.html', 'Timer.js.html', 'fileUtils.js.html', 'index.html', 'objectUtils.js.html', 'parserUtils.js.html'] }], 'files': ['ConfigReader.js.html', 'FileStatements.js.html', 'InputFileResolver.js.html', 'Mutant.js.html', 'MutantTestMatcher.js.html', 'MutatorOrchestrator.js.html', 'PluginLoader.js.html', 'ReporterOrchestrator.js.html', 'Sandbox.js.html', 'SandboxCoordinator.js.html', 'ScoreResultCalculator.js.html', 'Stryker.js.html', 'TestFrameworkOrchestrator.js.html', 'index.html', 'stryker-80x80.png', 'stryker-cli.js.html', 'stryker.css', 'stryker.js'] });
  });
});

interface Directory {
  name: string;
  files: string[];
  directories: Directory[];
}

let readDirectoryTree = (current = REPORT_DIR): Directory => {
  let dir: Directory = {
    name: path.basename(current),
    directories: [],
    files: []
  };
  let fileNames = fs.readdirSync(current);
  fileNames
    .sort()
    .map(filename => path.join(current, filename))
    .map(path => ({ path, stats: fs.statSync(path) }))
    .forEach(file => {
      if (file.stats.isDirectory()) {
        dir.directories.push(readDirectoryTree(file.path));
      } else {
        dir.files.push(path.basename(file.path));
      }
    });
  return dir;
};
