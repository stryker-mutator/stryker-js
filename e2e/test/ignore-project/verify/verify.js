import { expect } from 'chai';
import { MutantStatus } from 'mutation-testing-report-schema';

import { expectMetricsJsonToMatchSnapshot, readMutationTestingJsonResultAsMetricsResult } from '../../../helpers.js';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should report mutants that are disabled by a comment with correct ignore reason', async () => {
    const actualMetricsResult = await readMutationTestingJsonResultAsMetricsResult();
    const addResult = actualMetricsResult.systemUnderTestMetrics.childResults.find((file) => file.name.endsWith('Add.js')).file;
    const mutantsAtLine31 = addResult.mutants.filter(({ location }) => location.start.line === 31);
    const booleanLiteralMutants = mutantsAtLine31.filter(({ mutatorName }) => mutatorName === 'BooleanLiteral');
    const conditionalExpressionMutants = mutantsAtLine31.filter(({ mutatorName }) => mutatorName === 'ConditionalExpression');
    const equalityOperatorMutants = mutantsAtLine31.filter(({ mutatorName }) => mutatorName === 'EqualityOperator');
    booleanLiteralMutants.forEach((booleanMutant) => {
      expect(booleanMutant.status).eq(MutantStatus.Ignored);
      expect(booleanMutant.statusReason).eq('Ignore boolean and conditions');
    });
    conditionalExpressionMutants.forEach((conditionalMutant) => {
      expect(conditionalMutant.status).eq(MutantStatus.Ignored);
      expect(conditionalMutant.statusReason).eq('Ignore boolean and conditions');
    });
    equalityOperatorMutants.forEach((equalityMutant) => {
      expect(equalityMutant.status).eq(MutantStatus.NoCoverage);
    });
  });
  it('should report mutants that result from excluded mutators with the correct ignore reason', async () => {
    const actualMetricsResult = await readMutationTestingJsonResultAsMetricsResult();
    const circleResult = actualMetricsResult.systemUnderTestMetrics.childResults.find((file) => file.name.endsWith('Circle.js')).file;
    const mutantsAtLine3 = circleResult.mutants.filter(({ location }) => location.start.line === 3);
    mutantsAtLine3.forEach((mutant) => {
      expect(mutant.status).eq(MutantStatus.Ignored);
      expect(mutant.statusReason).eq('Ignored because of excluded mutation "ArithmeticOperator"');
    });
  });
});
