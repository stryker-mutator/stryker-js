import { CoverageData, MutantCoverage } from '@stryker-mutator/api/core';

function mergeCoverageData(target: CoverageData, source: CoverageData) {
  Object.keys(source).forEach((mutantId) => {
    const mutantIdNumber = parseInt(mutantId, 10);
    if (target[mutantIdNumber]) {
      target[mutantIdNumber] += source[mutantIdNumber];
    } else {
      target[mutantIdNumber] = source[mutantIdNumber];
    }
  });
}

export function mergeMutantCoverage(target: MutantCoverage, source: MutantCoverage | undefined): void {
  if (source) {
    mergeCoverageData(target.static, source.static);

    Object.keys(source.perTest).forEach((testId) => {
      if (!target.perTest[testId]) {
        target.perTest[testId] = {};
      }
      mergeCoverageData(target.perTest[testId], source.perTest[testId]);
    });
  }
}
