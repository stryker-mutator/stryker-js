import path from 'path';

import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';

import {
  createVitestTestRunnerFactory,
  VitestTestRunner,
} from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { createVitestRunnerOptions } from '../util/factories.js';

for (const related of [false, true]) {
  describe(`Vitest test selection (related = ${related})`, () => {
    let sut: VitestTestRunner;
    let sandbox: TempTestDirectorySandbox;
    let sandboxFileName: string;

    beforeEach(async () => {
      sut = testInjector.injector.injectFunction(
        createVitestTestRunnerFactory('__stryker2__'),
      );
      const options =
        testInjector.options as VitestRunnerOptionsWithStrykerOptions;
      options.vitest = createVitestRunnerOptions({
        related,
        configFile: 'vitest.selection.config.js',
      });
      sandbox = new TempTestDirectorySandbox('simple-project');
      await sandbox.init();
      sandboxFileName = path.resolve(sandbox.tmpDir, 'math.ts');
      await sut.init();
    });

    afterEach(async () => {
      await sut.dispose();
      await sandbox.dispose();
    });

    it('should round-trip coverage IDs into executed tests across repeated selections', async () => {
      const dryRun = await sut.dryRun(
        factory.dryRunOptions({ files: [sandboxFileName] }),
      );
      assertions.expectCompleted(dryRun);
      expect(dryRun.tests).lengthOf(3);
      const addTest = dryRun.tests.find(
        ({ name }) =>
          name.includes('nested (group)') && name.endsWith('adds .* numbers?'),
      )!;
      const negativeTest = dryRun.tests.find(({ name }) =>
        name.endsWith('recognizes a negative number'),
      )!;
      expect(addTest, 'the nested addition test').not.undefined;
      expect(negativeTest, 'the negative-number test').not.undefined;
      expect(dryRun.mutantCoverage!.perTest[addTest.id]['2']).greaterThan(0);
      expect(dryRun.mutantCoverage!.perTest[negativeTest.id]['11']).greaterThan(
        0,
      );
      expect(Object.keys(dryRun.mutantCoverage!.perTest).sort()).deep.eq(
        dryRun.tests.map(({ id }) => id).sort(),
      );

      const kill = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          sandboxFileName,
          mutantActivation: 'runtime',
          testFilter: [addTest.id],
        }),
      );
      assertions.expectKilled(kill);
      expect(kill.nrOfTests).eq(1);
      expect(kill.killedBy).deep.eq([addTest.id]);

      const survivor = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '11' }),
          sandboxFileName,
          mutantActivation: 'runtime',
          testFilter: [negativeTest.id],
        }),
      );
      assertions.expectSurvived(survivor);
      expect(survivor.nrOfTests).eq(1);

      const nextKill = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '12' }),
          sandboxFileName,
          mutantActivation: 'runtime',
          testFilter: [negativeTest.id],
        }),
      );
      assertions.expectKilled(nextKill);
      expect(nextKill.nrOfTests).eq(1);
      expect(nextKill.killedBy).deep.eq([negativeTest.id]);

      const unfiltered = await sut.dryRun(
        factory.dryRunOptions({ files: [sandboxFileName] }),
      );
      assertions.expectCompleted(unfiltered);
      expect(unfiltered.tests.map(({ id }) => id).sort()).deep.eq(
        dryRun.tests.map(({ id }) => id).sort(),
      );
      for (const { id, status } of unfiltered.tests) {
        expect(status).eq(TestStatus.Success);
        expect(
          Object.values(unfiltered.mutantCoverage!.perTest[id]).some(
            (hits) => hits > 0,
          ),
        ).true;
      }
    });
  });
}
