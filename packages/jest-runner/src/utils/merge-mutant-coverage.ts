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

export function mergeMutantCoverage(mutantCoverageReports: MutantCoverage[]): MutantCoverage | undefined {
  if (mutantCoverageReports.length) {
    const merged: MutantCoverage = {
      perTest: {},
      static: {},
    };
    mutantCoverageReports.forEach((report) => {
      mergeCoverageData(merged.static, report.static);

      Object.keys(report.perTest).forEach((testId) => {
        if (!merged.perTest[testId]) {
          merged.perTest[testId] = {};
        }
        mergeCoverageData(merged.perTest[testId], report.perTest[testId]);
      });
    });
    return merged;
  } else {
    return undefined;
  }
}
