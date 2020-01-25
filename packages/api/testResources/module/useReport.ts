import {
  Reporter,
  MutantResult,
  MutantStatus,
  SourceFile,
  MatchedMutant
} from '@stryker-mutator/api/report';

class EmptyReporter implements Reporter {}

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
const allReporter = new AllReporter();
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
  timeSpentScopedTests: 52,
  runAllTests: false,
};

allReporter.onAllMutantsMatchedWithTests([Object.freeze(matchedMutant)]);
const allMutants = Object.freeze([matchedMutant]);
allReporter.onAllMutantsMatchedWithTests(allMutants);
