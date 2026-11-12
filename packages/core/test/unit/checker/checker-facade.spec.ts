import { CheckStatus } from '@stryker-mutator/api/check';
import { factory } from '@stryker-mutator/test-helpers';

import { expect } from 'chai';
import sinon from 'sinon';

import { CheckerFacade } from '../../../src/checker/checker-facade.js';
import { CheckerResource } from '../../../src/checker/index.js';

describe(CheckerFacade.name, () => {
  let innerChecker: sinon.SinonStubbedInstance<CheckerResource>;
  let sut: CheckerFacade;

  beforeEach(() => {
    innerChecker = {
      init: sinon.stub(),
      group: sinon.stub(),
      check: sinon.stub(),
      dispose: sinon.stub(),
    };
    sut = new CheckerFacade(() => innerChecker);
  });

  describe('check', () => {
    it('should return checker result', async () => {
      const mutant1 = factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ id: '1' }),
      });
      const mutant2 = factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ id: '2' }),
      });

      innerChecker.check.returns(
        Promise.resolve({
          [mutant1.mutant.id]: { status: CheckStatus.Passed },
          [mutant2.mutant.id]: {
            status: CheckStatus.CompileError,
            reason: 'Test',
          },
        }),
      );

      const result = await sut.check('test-checker', [mutant1, mutant2]);

      expect(result).to.deep.equal([
        [mutant1, { status: CheckStatus.Passed }],
        [mutant2, { status: CheckStatus.CompileError, reason: 'Test' }],
      ]);
    });

    it('should not send the covering and killing tests to the checker', async () => {
      const mutantRunPlan = factory.mutantRunPlan({
        mutant: {
          ...factory.mutantTestCoverage({ id: '1', coveredBy: ['spec1'] }),
          killedBy: ['spec1'],
        },
      });
      innerChecker.check.resolves({ '1': { status: CheckStatus.Passed } });

      const result = await sut.check('test-checker', [mutantRunPlan]);

      const { coveredBy, killedBy, ...expectedMutant } = mutantRunPlan.mutant;
      sinon.assert.calledOnceWithExactly(innerChecker.check, 'test-checker', [
        expectedMutant,
      ]);
      expect(result).to.deep.equal([
        [mutantRunPlan, { status: CheckStatus.Passed }],
      ]);
      expect(result[0][0].mutant.coveredBy).deep.eq(['spec1']);
    });

    it('should throw an error when checker does not return all mutants', async () => {
      innerChecker.check.returns(
        Promise.resolve({ '1': { status: CheckStatus.Passed } }),
      );

      await expect(
        sut.check('test-checker', [
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '1' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '2' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '3' }),
          }),
        ]),
      ).to.be.rejectedWith(
        'Checker "test-checker" was missing check results for mutant ids "2,3", while Stryker asked to check them',
      );
    });

    it('should throw an error when checker returns to many mutants', async () => {
      innerChecker.check.returns(
        Promise.resolve({
          '1': { status: CheckStatus.Passed },
          '2': { status: CheckStatus.Passed },
          '3': { status: CheckStatus.Passed },
        }),
      );

      await expect(
        sut.check('test-checker', [
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '1' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '2' }),
          }),
        ]),
      ).to.be.rejectedWith(
        'Checker "test-checker" returned a check result for mutant id "3", but a check wasn\'t requested for it. Stryker asked to check mutant ids: 1,2',
      );
    });
  });

  describe('group', () => {
    it('should return group result', async () => {
      const mutant1 = factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ id: '1' }),
      });
      const mutant2 = factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ id: '2' }),
      });

      innerChecker.group.returns(
        Promise.resolve([[mutant1.mutant.id, mutant2.mutant.id]]),
      );

      const result = await sut.group('test-checker', [mutant1, mutant2]);

      expect(result).to.deep.equal([[mutant1, mutant2]]);
    });

    it('should not send the covering and killing tests to the checker', async () => {
      const mutantRunPlan = factory.mutantRunPlan({
        mutant: {
          ...factory.mutantTestCoverage({ id: '1', coveredBy: ['spec1'] }),
          killedBy: ['spec1'],
        },
      });
      innerChecker.group.resolves([['1']]);

      const result = await sut.group('test-checker', [mutantRunPlan]);

      const { coveredBy, killedBy, ...expectedMutant } = mutantRunPlan.mutant;
      sinon.assert.calledOnceWithExactly(innerChecker.group, 'test-checker', [
        expectedMutant,
      ]);
      expect(result).to.deep.equal([[mutantRunPlan]]);
      expect(result[0][0].mutant.coveredBy).deep.eq(['spec1']);
    });

    it('should throw an error when group returns to many mutants', async () => {
      innerChecker.group.returns(Promise.resolve([['1', '2', '3']]));

      await expect(
        sut.group('test-checker', [
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '1' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '2' }),
          }),
        ]),
      ).to.be.rejectedWith(
        'Checker "test-checker" returned a group result for mutant id "3", but a group wasn\'t requested for it. Stryker asked to group mutant ids: 1,2!',
      );
    });

    it('should throw an error when checker returns not all mutants', async () => {
      innerChecker.group.returns(Promise.resolve([['1']]));

      await expect(
        sut.group('test-checker', [
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '1' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '2' }),
          }),
          factory.mutantRunPlan({
            mutant: factory.mutantTestCoverage({ id: '3' }),
          }),
        ]),
      ).to.be.rejectedWith(
        'Checker "test-checker" was missing group results for mutant ids "2,3", while Stryker asked to group them!',
      );
    });
  });
});
