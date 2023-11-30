import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot, readMutationTestingJsonResult } from '../../../helpers.js';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });

  it('should report mutants that are disabled by a comment with correct ignore reason', async () => {
    const report = await readMutationTestingJsonResult();
    const addResult = report.files['src/Add.js'];
    const mutantsAtLine35 = addResult.mutants.filter(({ location }) => location.start.line === 35);
    const booleanLiteralMutants = mutantsAtLine35.filter(({ mutatorName }) => mutatorName === 'BooleanLiteral');
    const conditionalExpressionMutants = mutantsAtLine35.filter(({ mutatorName }) => mutatorName === 'ConditionalExpression');
    const equalityOperatorMutants = mutantsAtLine35.filter(({ mutatorName }) => mutatorName === 'EqualityOperator');
    expect(booleanLiteralMutants).lengthOf(1);
    expect(conditionalExpressionMutants).lengthOf(3);
    expect(equalityOperatorMutants).lengthOf(2);
    booleanLiteralMutants.forEach((booleanMutant) => {
      expect(booleanMutant.status).eq('Ignored');
      expect(booleanMutant.statusReason).eq('Ignore boolean and conditions');
    });
    conditionalExpressionMutants.forEach((conditionalMutant) => {
      expect(conditionalMutant.status).eq('Ignored');
      expect(conditionalMutant.statusReason).eq('Ignore boolean and conditions');
    });
    equalityOperatorMutants.forEach((equalityMutant) => {
      expect(equalityMutant.status).eq('NoCoverage');
    });
  });

  it('should report mutants that result from excluded mutators with the correct ignore reason', async () => {
    const report = await readMutationTestingJsonResult();
    const circleResult = report.files['src/Circle.js'];
    const mutantsAtLine3 = circleResult.mutants.filter(({ location }) => location.start.line === 3);
    expect(mutantsAtLine3).lengthOf(2);
    mutantsAtLine3.forEach((mutant) => {
      expect(mutant.status).eq('Ignored');
      expect(mutant.statusReason).eq('Ignored because of excluded mutation "ArithmeticOperator"');
    });
  });

  it('should report mutants that are ignored with an ignore plugin with the correct ignore reason', async () => {
    const report = await readMutationTestingJsonResult();
    const addResult = report.files['src/Add.js'];
    const mutantsAtLine2 = addResult.mutants.filter(({ location }) => location.start.line === 2);
    const mutantsAtLin8 = addResult.mutants.filter(({ location }) => location.start.line === 8);
    const mutantsAtLin13 = addResult.mutants.filter(({ location }) => location.start.line === 13);
    const mutantsAtLine18 = addResult.mutants.filter(({ location }) => location.start.line === 18);

    expect(mutantsAtLine2).lengthOf(2);
    expect(mutantsAtLin8).lengthOf(1);
    expect(mutantsAtLin13).lengthOf(1);
    expect(mutantsAtLine18).lengthOf(1);
    [...mutantsAtLine2, ...mutantsAtLin8, ...mutantsAtLin13].forEach((mutant) => {
      expect(mutant.status).eq('Ignored');
      expect(mutant.statusReason).eq("We're not interested in console.log statements for now");
    });
    mutantsAtLine18.forEach((mutant) => expect(mutant.status).eq('NoCoverage'));
  });
});
