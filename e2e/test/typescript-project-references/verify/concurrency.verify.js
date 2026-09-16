import { expect } from 'chai';

import {
  execStryker,
  readMutationTestingJsonResult,
} from '../../../helpers.js';

const RUNS = 5;
const CONCURRENCY = 4;

// Regression guard for the build-mode checker race: a mutant whose compile error
// only surfaces because src/core imports from the referenced src/utils project
// used to survive ~half the time under concurrent checker processes. Repeated
// runs must now report it as a compile error every time.
describe('typescript checker compile-error detection under concurrency', () => {
  it(`always invalidates the cross-project compile error over ${RUNS} runs at concurrency ${CONCURRENCY}`, async () => {
    for (let run = 1; run <= RUNS; run++) {
      const { exitCode } = execStryker(
        `stryker run --concurrency ${CONCURRENCY} --reporters json --fileLogLevel off`,
      );
      expect(exitCode, `stryker run ${run} exited with a non-zero code`).eq(0);

      const report = await readMutationTestingJsonResult();
      const allMutants = Object.values(report.files).flatMap(
        (file) => file.mutants,
      );
      const compileErrors = allMutants.filter(
        (mutant) => mutant.status === 'CompileError',
      );
      const coreIndex = Object.entries(report.files).find(([fileName]) =>
        fileName.endsWith('core/index.ts'),
      );
      const crossProjectMutant = coreIndex?.[1].mutants.find(
        (mutant) => mutant.mutatorName === 'BlockStatement',
      );

      expect(
        crossProjectMutant?.status,
        `run ${run}: the mutant in src/core/index.ts (which imports from src/utils) must be a compile error`,
      ).eq('CompileError');
      expect(
        compileErrors,
        `run ${run}: every run must find the same compile errors`,
      ).lengthOf(3);
    }
  });
});
