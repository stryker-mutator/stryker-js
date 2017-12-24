import { Reporter, MutantResult, MutantStatus, ReporterFactory, SourceFile, MatchedMutant } from 'stryker-api/report';

class EmptyReporter {
}

class AllReporter implements Reporter {
  onSourceFileRead(file: SourceFile) {
  }
  onAllSourceFilesRead(files: SourceFile[]) {
  }
  onMutantTested(result: MutantResult) {
  }
  onAllMutantsTested(results: MutantResult[]) {
  }
  onAllMutantsMatchedWithTests(mutants: ReadonlyArray<MatchedMutant>) {
  }
  wrapUp() {
    return new Promise<void>(r => r());
  }
}

ReporterFactory.instance().register('empty', EmptyReporter);
ReporterFactory.instance().register('all', AllReporter);
console.log(ReporterFactory.instance().knownNames());
let emptyReporter = ReporterFactory.instance().create('empty', {});
let allReporter = ReporterFactory.instance().create('all', {});
if (!(emptyReporter instanceof EmptyReporter)) {
  throw Error('Something wrong with empty reporter');
}
if (!(allReporter instanceof AllReporter)) {
  throw Error('Something wrong with all reporter');
}

let result: MutantResult = {
  id: '13',
  sourceFilePath: 'string',
  mutatorName: 'string',
  status: MutantStatus.TimedOut,
  replacement: 'string',
  originalLines: 'string',
  mutatedLines: 'string',
  testsRan: [''],
  location: null,
  range: [1, 2]
};
allReporter.onMutantTested(result);
console.log(result);
console.log(`Mutant status runtime error: ${MutantStatus[MutantStatus.RuntimeError]}`);
console.log(`Mutant status transpile error: ${MutantStatus[MutantStatus.TranspileError]}`);

const matchedMutant: MatchedMutant = {
  id: '13',
  mutatorName: '',
  scopedTestIds: [52],
  timeSpentScopedTests: 52,
  fileName: 'string',
  replacement: 'string'
};

allReporter.onAllMutantsMatchedWithTests([Object.freeze(matchedMutant)]);
const allMutants = Object.freeze([matchedMutant]);
allReporter.onAllMutantsMatchedWithTests(allMutants);
