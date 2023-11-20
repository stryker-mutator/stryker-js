import path from 'path';

import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';

import { normalizeFileName } from '@stryker-mutator/util';

import { collectTestsFromSuite, convertTestToTestResult, fromTestId, toRawTestId } from '../../src/vitest-helpers.js';
import { createSuite, createVitestFile, createVitestTest } from '../util/factories.js';

describe('vitest-helpers', () => {
  describe(toRawTestId.name, () => {
    it('should return correct testId', () => {
      // Using normalizeFileName here mimics the behavior of vitest on windows: using forward slashes
      const filePath = normalizeFileName(path.resolve('src', 'file.js'));
      const test = createVitestTest({ file: createVitestFile({ filepath: filePath }) });
      const result = toRawTestId(test);
      expect(result).to.be.equal(`${filePath}#suite test1`);
    });
  });

  describe(fromTestId.name, () => {
    it('should return correct file and test name', () => {
      const { file, test } = fromTestId('file.js#test1');
      expect(file).to.be.equal('file.js');
      expect(test).to.be.equal('test1');
    });
  });

  describe(convertTestToTestResult.name, () => {
    it('should have status skipped if taskState is skipped', () => {
      const test = createVitestTest({ result: { state: 'skip' } });
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Skipped);
    });

    it('should have status skipped if task state is todo', () => {
      const test = createVitestTest({ result: { state: 'todo' } });
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Skipped);
    });

    it('should have status Failed if result is undefined', () => {
      const test = createVitestTest({ result: undefined });
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Failed);
    });
  });

  describe(collectTestsFromSuite.name, () => {
    it('should return empty array for an empty suite', () => {
      const suite = createSuite({ type: 'suite', tasks: [] });
      const result = collectTestsFromSuite(suite);
      expect(result).to.be.empty;
    });
    it('should return 1 test for a suite with 1 test', () => {
      const suite = createSuite({ tasks: [createVitestTest()] });
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(1);
    });

    it('should return 2 tests for a suite with 2 tests', () => {
      const suite = createSuite({ tasks: [createVitestTest({ name: 'test1', id: '1' }), createVitestTest({ name: 'test2', id: '2' })] });
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });

    it('should return 2 tests for a suite with nested suite with 2 tests', () => {
      const suite = createSuite({
        tasks: [
          createSuite({
            id: '2',
            name: 'suite2',
            tasks: [createVitestTest({ name: 'test1', id: '1' }), createVitestTest({ name: 'test2', id: '2' })],
          }),
        ],
      });
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });
  });
});
