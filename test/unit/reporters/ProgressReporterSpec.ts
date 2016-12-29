// import ProgressReporter from '../../../src/reporters/ProgressReporter';
// import * as progressBarModule from '../../../src/reporters/ProgressBar';
// import { MutantStatus, MutantResult, MatchedMutant } from 'stryker-api/report';
// import { expect } from 'chai';
// import * as sinon from 'sinon';
// import * as chalk from 'chalk';

// describe('ProgressReporter', () => {

//     let sut: ProgressReporter;
//     let sandbox: sinon.SinonSandbox;
//     let matchedMutants: MatchedMutant[];
//     let progressBar: { tick: sinon.SinonStub, render: sinon.SinonStub };
//     const progressBarContent: string =
//             `Mutation testing [:bar] :percent (ETC :etas) ` +
//             `[:killed ${chalk.green.bold('killed')}] ` +
//             `[:survived ${chalk.red.bold('survived')}] ` +
//             `[:noCoverage ${chalk.red.bold('no coverage')}] ` +
//             `[:timeout ${chalk.yellow.bold('timeout')}] ` +
//             `[:error ${chalk.yellow.bold('error')}]`;
//     let progressBarOptions: any = { complete: '=', incomplete: ' ', total: null };

//     beforeEach(() => {
//         sut = new ProgressReporter();
//         sandbox = sinon.sandbox.create();
//         progressBar = { tick: sandbox.stub(), render: sandbox.stub() };
//         sandbox.stub(progressBarModule, 'default').returns(progressBar);
//     });

//     afterEach(() => {
//         sandbox.restore();
//     });

//     describe('onAllMutantsMatchedWithTests()', () => {
//         describe('when there are 3 MatchedMutants that all contain Tests', () => {
//             beforeEach(() => {
//                 matchedMutants = [matchedMutant(1), matchedMutant(4), matchedMutant(2)];

//                 sut.onAllMutantsMatchedWithTests(matchedMutants);
//             });

//             it('the total of MatchedMutants in the progressbar should be 3', () => {
//                 progressBarOptions.total = 3;
//                 expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, progressBarOptions);
//             });
//         });
//         describe('when there are 2 MatchedMutants that all contain Tests and 1 MatchMutant that doesnt have tests', () => {
//             beforeEach(() => {
//                 matchedMutants = [matchedMutant(1), matchedMutant(0), matchedMutant(2)];

//                 sut.onAllMutantsMatchedWithTests(matchedMutants);
//             });

//             it('the total of MatchedMutants in the progressbar should be 2', () => {
//                 progressBarOptions.total = 2;
//                 expect(progressBarModule.default).to.have.been.calledWithMatch(progressBarContent, progressBarOptions);
//             });
//         });
//     });

//     describe('onMutantTested()', () => {
//         let progressBarTickTokens: any;

//         beforeEach(() => {
//             matchedMutants = [matchedMutant(1), matchedMutant(4), matchedMutant(2)];

//             sut.onAllMutantsMatchedWithTests(matchedMutants);
//         });

//         describe('when status is KILLED', () => {

//             beforeEach(() => {
//                 sut.onMutantTested(mutantResult(MutantStatus.Killed));
//             });

//             it('should report 1 killed mutant', () => {
//                 progressBarTickTokens = { error: 0, killed: 1, noCoverage: 0, survived: 0, timeout: 0 };
//                 expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
//             });
//         });

//         describe('when status is TIMEDOUT', () => {

//             beforeEach(() => {
//                 sut.onMutantTested(mutantResult(MutantStatus.TimedOut));
//             });

//             it('should report 1 timed out mutant', () => {
//                 progressBarTickTokens = { error: 0, killed: 0, noCoverage: 0, survived: 0, timeout: 1 };
//                 expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
//             });
//         });

//         describe('when status is SURVIVED', () => {

//             beforeEach(() => {
//                 sut.onMutantTested(mutantResult(MutantStatus.Survived));
//             });

//             it('should report 1 survived mutant', () => {
//                 progressBarTickTokens = { error: 0, killed: 0, noCoverage: 0, survived: 1, timeout: 0 };
//                 expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
//             });
//         });

//         describe('when status is ERRORED', () => {

//             beforeEach(() => {
//                 sut.onMutantTested(mutantResult(MutantStatus.Error));
//             });

//             it('should report 1 errored mutant', () => {
//                 progressBarTickTokens = { error: 1, killed: 0, noCoverage: 0, survived: 0, timeout: 0 };
//                 expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
//             });
//         });

//         describe('when status is NO COVERAGE', () => {

//             beforeEach(() => {
//                 sut.onMutantTested(mutantResult(MutantStatus.NoCoverage));
//             });

//             it('should not report immediately', () => {
//                 expect(progressBar.tick).to.not.have.been.called;
//             });

//             describe('and then the status is KILLED', () => {

//                 beforeEach(() => {
//                     sut.onMutantTested(mutantResult(MutantStatus.Killed));
//                 });

//                 it('should report 1 not covered mutant and 1 killed mutant', () => {
//                     progressBarTickTokens = { error: 0, killed: 1, noCoverage: 1, survived: 0, timeout: 0 };
//                     expect(progressBar.tick).to.have.been.calledWithMatch(progressBarTickTokens);
//                 });
//             });
//         });
//     });
// });

// function mutantResult(status: MutantStatus): MutantResult {
//     return {
//         location: null,
//         mutatedLines: null,
//         mutatorName: null,
//         originalLines: null,
//         replacement: null,
//         sourceFilePath: null,
//         testsRan: null,
//         status,
//         range: null
//     };
// }

// function matchedMutant(numberOfTests: number): MatchedMutant {
//     let scopedTestIds: number[] = [];
//     for (let i = 0; i < numberOfTests; i++) {
//         scopedTestIds.push(1);
//     }
//     return {
//         mutatorName: null,
//         scopedTestIds: scopedTestIds,
//         timeSpentScopedTests: null,
//         filename: null,
//         replacement: null
//     };
// }
