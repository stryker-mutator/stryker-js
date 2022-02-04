import path from 'path';

import { expect } from 'chai';

import * as producers from '../../helpers/producers.js';

import { verifyAllTestFilesHaveCoverage } from '../../../src/utils/index.js';

describe(verifyAllTestFilesHaveCoverage.name, () => {
  it('should not fail when all files have coverage', () => {
    const result = verifyAllTestFilesHaveCoverage(
      producers.createJestAggregatedResult({
        testResults: [
          producers.createJestTestResult({ testFilePath: path.resolve('foo.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('bar.spec.js') }),
        ],
      }),
      [path.resolve('foo.spec.js'), path.resolve('bar.spec.js')]
    );
    expect(result).undefined;
  });

  it('should give correct error message for 3 files without coverage', () => {
    const result = verifyAllTestFilesHaveCoverage(
      producers.createJestAggregatedResult({
        testResults: [
          producers.createJestTestResult({ testFilePath: path.resolve('foo.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('bar.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('baz.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('qux.spec.js') }),
        ],
      }),
      [path.resolve('bar.spec.js')]
    );
    const expected = `
Missing coverage results for:
  * foo.spec.js
  * baz.spec.js
  * qux.spec.js

You probably configured a test environment in jest that is not reporting code coverage to Stryker.`;
    expect(result?.substr(0, expected.length)).eq(expected);
  });

  it('should give notification about more files when there are more than 3 files without coverage', () => {
    const result = verifyAllTestFilesHaveCoverage(
      producers.createJestAggregatedResult({
        testResults: [
          producers.createJestTestResult({ testFilePath: path.resolve('foo.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('bar.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('baz.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('qux.spec.js') }),
          producers.createJestTestResult({ testFilePath: path.resolve('quux.spec.js') }),
        ],
      }),
      [path.resolve('bar.spec.js')]
    );
    const expected = `
Missing coverage results for:
  * foo.spec.js
  * baz.spec.js
  * qux.spec.js
  (and 1 more)

You probably configured a test environment in jest that is not reporting code coverage to Stryker.`;
    expect(result?.substr(0, expected.length)).eq(expected);
  });
});
