import type { IFormatterOptions } from '@cucumber/cucumber';
import {
  Envelope,
  GherkinDocument,
  TestCase,
  Pickle,
  TestCaseStarted,
  TestCaseFinished,
  Timestamp,
  Scenario,
  TestStepFinished,
  TestStepResultStatus,
  Location,
  TableRow,
} from '@cucumber/messages';
import type {
  CoverageAnalysis,
  InstrumenterContext,
  Position,
  // @ts-expect-error see https://github.com/microsoft/TypeScript/issues/49721#issuecomment-1319854183
} from '@stryker-mutator/api/core';
// @ts-expect-error see https://github.com/microsoft/TypeScript/issues/49721#issuecomment-1319854183
import type { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';

import { Formatter } from './cucumber-wrapper.cjs';

interface DescribedScenario extends Scenario {
  fileName: string;
  fullName: string;
}

/**
 * Temp solution. We are not able to require the "real" TestStatus enum, because we cannot "require" from an ESM.
 */
const TestStatusCopy = {
  /**
   * The test succeeded
   */
  Success: 0 as unknown as TestStatus.Success,
  /**
   * The test failed
   */
  Failed: 1 as unknown as TestStatus.Failed,
  /**
   * The test was skipped (not executed)
   */
  Skipped: 2 as unknown as TestStatus.Skipped,
};

export default class StrykerFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options);
    StrykerFormatter.instance = this;
    options.eventBroadcaster.on('envelope', this.handleEnvelope.bind(this));
  }

  private readonly documents: GherkinDocument[] = [];
  private readonly scenarios: DescribedScenario[] = [];
  private readonly pickles: Pickle[] = [];
  private readonly testCases: TestCase[] = [];
  private readonly testCasesStarted: TestCaseStarted[] = [];
  private readonly testStepsFinished: TestStepFinished[] = [];
  public reportedTestResults: TestResult[] = [];

  private handleEnvelope(envelope: Envelope) {
    if (envelope.testCase) {
      this.testCases.push(envelope.testCase);
    } else if (envelope.gherkinDocument) {
      this.documents.push(envelope.gherkinDocument);
      this.scenarios.push(...collectScenarios(envelope.gherkinDocument));
    } else if (envelope.testCaseStarted) {
      this.testCasesStarted.push(envelope.testCaseStarted);
      const { example, scenario } = this.findDetails(
        envelope.testCaseStarted.id,
      );
      if (StrykerFormatter.coverageAnalysis === 'perTest') {
        StrykerFormatter.instrumenterContext.currentTestId = determineTestId(
          scenario,
          example,
        );
      }
    } else if (envelope.testCaseFinished) {
      this.reportTestCase(envelope.testCaseFinished);
      StrykerFormatter.instrumenterContext.currentTestId = undefined;
    } else if (envelope.pickle) {
      this.pickles.push(envelope.pickle);
    } else if (envelope.testStepFinished) {
      this.testStepsFinished.push(envelope.testStepFinished);
    }
  }

  public static instrumenterContext: InstrumenterContext;

  public static instance: StrykerFormatter | undefined;
  public static coverageAnalysis: CoverageAnalysis;

  private reportTestCase(testCaseFinished: TestCaseFinished) {
    const { scenario, example, currentTestCaseStarted, testSteps } =
      this.findDetails(testCaseFinished.testCaseStartedId);

    const testAttributes = {
      id: determineTestId(scenario, example),
      name: determineName(scenario, example),
      timeSpentMs: timeDiffMs(
        currentTestCaseStarted.timestamp,
        testCaseFinished.timestamp,
      ),
      fileName: scenario.fileName,
      startPosition: determinePosition(scenario, example),
    };
    const status = determineTestStatus(testSteps);
    if (status === TestStatusCopy.Failed) {
      this.reportedTestResults.push({
        status,
        failureMessage: determineFailureMessage(testSteps),
        ...testAttributes,
      });
    } else {
      this.reportedTestResults.push({
        status,
        ...testAttributes,
      });
    }
  }

  private findDetails(testCaseStartedId: string) {
    const currentTestCaseStarted = this.testCasesStarted.find(
      (testCase) => testCase.id === testCaseStartedId,
    )!;
    const currentTestCase = this.testCases.find(
      (testCase) => testCase.id === currentTestCaseStarted.testCaseId,
    )!;
    const currentPickle = this.pickles.find(
      (pickle) => pickle.id === currentTestCase.pickleId,
    )!;
    const currentScenario = this.scenarios.find((scenario) =>
      currentPickle.astNodeIds.includes(scenario.id),
    )!;
    const testSteps = this.testStepsFinished.filter(
      (testStep) => testStep.testCaseStartedId === currentTestCaseStarted.id,
    );
    const currentExample = currentScenario.examples
      .flatMap((example) => example.tableBody)
      .find((example) => currentPickle.astNodeIds.includes(example.id));
    return {
      scenario: currentScenario,
      example: currentExample,
      currentTestCaseStarted,
      testSteps,
    };
  }
}

const failureStatusList = Object.freeze([
  TestStepResultStatus.FAILED,
  TestStepResultStatus.AMBIGUOUS,
]);
function determineTestId(
  scenario: DescribedScenario,
  example: TableRow | undefined,
) {
  return `${scenario.fileName}:${
    (example?.location ?? scenario.location).line
  }`;
}

function determineTestStatus(testSteps: TestStepFinished[]): TestStatus {
  if (
    !testSteps.some(
      (testStep) =>
        testStep.testStepResult.status !== TestStepResultStatus.PASSED,
    )
  ) {
    return TestStatusCopy.Success;
  }
  if (
    testSteps.some((testStep) =>
      failureStatusList.includes(testStep.testStepResult.status),
    )
  ) {
    return TestStatusCopy.Failed;
  }
  return TestStatusCopy.Skipped;
}

function determineFailureMessage(testSteps: TestStepFinished[]): string {
  const failureStep = testSteps.find(
    (testStep) =>
      failureStatusList.includes(testStep.testStepResult.status) &&
      testStep.testStepResult.message,
  );
  return failureStep?.testStepResult.message ?? 'Failed';
}

function timeDiffMs(start: Timestamp, end: Timestamp) {
  return (
    (end.seconds - start.seconds) * 1000 + (end.nanos - start.nanos) / 1_000_000
  );
}
function* collectScenarios(
  gherkinDocument: GherkinDocument,
): Iterable<DescribedScenario> {
  if (gherkinDocument.feature?.children) {
    // eslint-disable-next-line no-unsafe-optional-chaining -- it is safe, see line above ☝
    for (const child of gherkinDocument.feature?.children) {
      if (child.scenario) {
        yield {
          fileName: gherkinDocument.uri!,
          fullName: `Feature: ${gherkinDocument.feature.name} -- ${child.scenario.keyword}: ${child.scenario.name}`,
          ...child.scenario,
        };
      }
      if (child.rule) {
        for (const ruleChild of child.rule.children) {
          if (ruleChild.scenario) {
            yield {
              fileName: gherkinDocument.uri!,
              fullName: `Feature: ${gherkinDocument.feature.name} -- Rule: ${child.rule.name} -- ${ruleChild.scenario.keyword}: ${ruleChild.scenario.name}`,
              ...ruleChild.scenario,
            };
          }
        }
      }
    }
  }
}

function determinePosition(
  scenario: DescribedScenario,
  example: TableRow | undefined,
): Position {
  return toPosition(example?.location ?? scenario.location);
}

function toPosition(location: Location): Position {
  return {
    line: location.line - 1, // StrykerJS works 0- based internally
    column: location.column ?? 0,
  };
}
function determineName(
  scenario: DescribedScenario,
  example: TableRow | undefined,
) {
  if (example) {
    return `${scenario.fullName} [Example L${example.location.line}]`;
  }
  return scenario.fullName;
}
