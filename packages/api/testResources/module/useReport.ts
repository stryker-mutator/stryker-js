import {
  Reporter,
  MutantResult,
  MutantStatus,
  ReporterFactory,
  SourceFile,
  MatchedMutant
} from '@stryker-mutator/api/report';
import { Config } from '@stryker-mutator/api/config';
class EmptyReporter {}

class AllReporter implements Reporter {
  public onSourceFileRead(file: SourceFile) {}
  public onAllSourceFilesRead(files: SourceFile[]) {}
  public onMutantTested(result: MutantResult) {}
  public onAllMutantsTested(results: MutantResult[]) {}
  public onAllMutantsMatchedWithTests(mutants: ReadonlyArray<MatchedMutant>) {}
  public wrapUp() {
    return new Promise<void>(r => r());
  }
}

ReporterFactory.instance().register('empty', EmptyReporter);
ReporterFactory.instance().register('all', AllReporter);
console.log(ReporterFactory.instance().knownNames());
const emptyReporter = ReporterFactory.instance().create('empty', new Config());
const allReporter = ReporterFactory.instance().create('all', new Config());
if (!(emptyReporter instanceof EmptyReporter)) {
  throw Error('Something wrong with empty reporter');
}
if (!(allReporter instanceof AllReporter)) {
  throw Error('Something wrong with all reporter');
}

const result: MutantResult = {
  id: '13',
  location: null,
  mutatedLines: 'string',
  mutatorName: 'string',
  originalLines: 'string',
  range: [1, 2],
  replacement: 'string',
  sourceFilePath: 'string',
  status: MutantStatus.TimedOut,
  testsRan: ['']
};
allReporter.onMutantTested(result);
console.log(result);
console.log(
  `Mutant status runtime error: ${MutantStatus[MutantStatus.RuntimeError]}`
);
console.log(
  `Mutant status transpile error: ${MutantStatus[MutantStatus.TranspileError]}`
);

const matchedMutant: MatchedMutant = {
  fileName: 'string',
  id: '13',
  mutatorName: '',
  replacement: 'string',
  scopedTestIds: [52],
  timeSpentScopedTests: 52
};

allReporter.onAllMutantsMatchedWithTests([Object.freeze(matchedMutant)]);
const allMutants = Object.freeze([matchedMutant]);
allReporter.onAllMutantsMatchedWithTests(allMutants);
