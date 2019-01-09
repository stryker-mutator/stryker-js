import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import HtmlReporter from '../../src/HtmlReporter';
import EventPlayer from '../helpers/EventPlayer';
import { readDirectoryTree } from '../helpers/fsHelpers';

const REPORT_DIR = 'reports/mutation/stryker';

describe('Html report of stryker', () => {
  let sut: HtmlReporter;

  beforeEach(() => {
    const config = new Config();
    config.set({ htmlReporter: { baseDir: REPORT_DIR } });
    sut = new HtmlReporter(config);
    return new EventPlayer('testResources/strykerEvents')
      .replay(sut)
      .then(() => sut.wrapUp());
  });

  it('should build all files in the report', () => {
    const dir = readDirectoryTree(REPORT_DIR);
    expect(dir).to.be.deep.equal({
      'ConfigReader.js.html': 'ConfigReader.js.html',
      'coverage': {
        'CoverageInstrumenter.js.html': 'CoverageInstrumenter.js.html',
        'CoverageInstrumenterStream.js.html': 'CoverageInstrumenterStream.js.html',
        'index.html': 'index.html'
      },
      'FileStatements.js.html': 'FileStatements.js.html',
      'index.html': 'index.html',
      'initializer': {
        'index.html': 'index.html',
        'NpmClient.js.html': 'NpmClient.js.html',
        'PromptOption.js.html': 'PromptOption.js.html',
        'StrykerConfigWriter.js.html': 'StrykerConfigWriter.js.html',
        'StrykerInitializer.js.html': 'StrykerInitializer.js.html',
        'StrykerInquirer.js.html': 'StrykerInquirer.js.html'
      },
      'InputFileResolver.js.html': 'InputFileResolver.js.html',
      'isolated-runner': {
        'index.html': 'index.html',
        'IsolatedRunnerOptions.js.html': 'IsolatedRunnerOptions.js.html',
        'IsolatedTestRunnerAdapter.js.html': 'IsolatedTestRunnerAdapter.js.html',
        'IsolatedTestRunnerAdapterFactory.js.html': 'IsolatedTestRunnerAdapterFactory.js.html',
        'IsolatedTestRunnerAdapterWorker.js.html': 'IsolatedTestRunnerAdapterWorker.js.html',
        'MessageProtocol.js.html': 'MessageProtocol.js.html',
        'ResilientTestRunnerFactory.js.html': 'ResilientTestRunnerFactory.js.html',
        'RetryDecorator.js.html': 'RetryDecorator.js.html',
        'TestRunnerDecorator.js.html': 'TestRunnerDecorator.js.html',
        'TimeoutDecorator.js.html': 'TimeoutDecorator.js.html'
      },
      'Mutant.js.html': 'Mutant.js.html',
      'MutantTestMatcher.js.html': 'MutantTestMatcher.js.html',
      'MutatorOrchestrator.js.html': 'MutatorOrchestrator.js.html',
      'mutators': {
        'ArrayDeclaratorMutator.js.html': 'ArrayDeclaratorMutator.js.html',
        'BinaryOperatorMutator.js.html': 'BinaryOperatorMutator.js.html',
        'BlockStatementMutator.js.html': 'BlockStatementMutator.js.html',
        'BooleanSubstitutionMutator.js.html': 'BooleanSubstitutionMutator.js.html',
        'index.html': 'index.html',
        'LogicalOperatorMutator.js.html': 'LogicalOperatorMutator.js.html',
        'RemoveConditionalsMutator.js.html': 'RemoveConditionalsMutator.js.html',
        'UnaryOperatorMutator.js.html': 'UnaryOperatorMutator.js.html',
        'UpdateOperatorMutator.js.html': 'UpdateOperatorMutator.js.html'
      },
      'PluginLoader.js.html': 'PluginLoader.js.html',
      'ReporterOrchestrator.js.html': 'ReporterOrchestrator.js.html',
      'reporters': {
        'BroadcastReporter.js.html': 'BroadcastReporter.js.html',
        'ClearTextReporter.js.html': 'ClearTextReporter.js.html',
        'ClearTextScoreTable.js.html': 'ClearTextScoreTable.js.html',
        'DotsReporter.js.html': 'DotsReporter.js.html',
        'EventRecorderReporter.js.html': 'EventRecorderReporter.js.html',
        'index.html': 'index.html',
        'ProgressAppendOnlyReporter.js.html': 'ProgressAppendOnlyReporter.js.html',
        'ProgressBar.js.html': 'ProgressBar.js.html',
        'ProgressKeeper.js.html': 'ProgressKeeper.js.html',
        'ProgressReporter.js.html': 'ProgressReporter.js.html',
        'StrictReporter.js.html': 'StrictReporter.js.html'
      },
      'Sandbox.js.html': 'Sandbox.js.html',
      'SandboxCoordinator.js.html': 'SandboxCoordinator.js.html',
      'ScoreResultCalculator.js.html': 'ScoreResultCalculator.js.html',
      'stryker-cli.js.html': 'stryker-cli.js.html',
      'Stryker.js.html': 'Stryker.js.html',
      'strykerResources': {
        'bootstrap': {
          css: {
            'bootstrap-grid.css': 'bootstrap-grid.css',
            'bootstrap-grid.min.css': 'bootstrap-grid.min.css',
            'bootstrap-reboot.css': 'bootstrap-reboot.css',
            'bootstrap-reboot.min.css': 'bootstrap-reboot.min.css',
            'bootstrap.css': 'bootstrap.css',
            'bootstrap.min.css': 'bootstrap.min.css'
          },
          js: {
            'bootstrap.bundle.js': 'bootstrap.bundle.js',
            'bootstrap.bundle.min.js': 'bootstrap.bundle.min.js',
            'bootstrap.js': 'bootstrap.js',
            'bootstrap.min.js': 'bootstrap.min.js'
          }
        },
        'highlightjs': {
          styles: {
            'default.css': 'default.css'
          }
        },
        'jquery': {
          dist: {
            'jquery.slim.min.js': 'jquery.slim.min.js'
          }
        },
        'popper.js': {
          dist: {
            umd: {
              'popper.min.js': 'popper.min.js'
            }
          }
        },
        'stryker': {
          'stryker-80x80.png': 'stryker-80x80.png',
          'stryker.css': 'stryker.css'
        },
        'stryker.js': 'stryker.js'
      },
      'TestFrameworkOrchestrator.js.html': 'TestFrameworkOrchestrator.js.html',
      'utils': {
        'fileUtils.js.html': 'fileUtils.js.html',
        'index.html': 'index.html',
        'objectUtils.js.html': 'objectUtils.js.html',
        'parserUtils.js.html': 'parserUtils.js.html',
        'StrykerTempFolder.js.html': 'StrykerTempFolder.js.html',
        'Task.js.html': 'Task.js.html',
        'Timer.js.html': 'Timer.js.html'
      }
    });
  });
});
