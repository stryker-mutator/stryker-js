import { expect } from 'chai';
import { FailedTestResult, TestStatus } from '@stryker-mutator/api/test-runner';

import {
  collectTestsFromSuite,
  convertTestToTestResult,
  fromTestId,
} from '../../src/vitest-helpers.js';
import { createSuite, createVitestTest } from '../util/factories.js';

describe('vitest-helpers', () => {
  describe(fromTestId.name, () => {
    it('should return correct file and test name', () => {
      const { file, test } = fromTestId('file.js#test1');
      expect(file).to.be.equal('file.js');
      expect(test).to.be.equal('test1');
    });
  });

  describe(convertTestToTestResult.name, () => {
    describe('taskState of test is skipped', () => {
      it('should have status skipped', () => {
        const test = createVitestTest({ result: { state: 'skip' } });
        const result = convertTestToTestResult(test);
        expect(result.status).to.be.equal(TestStatus.Skipped);
      });

      it('should have status failed in a failed suite', () => {
        const failureMessage =
          "Cannot read properties of undefined (reading 'get')";
        const suite = createSuite({
          result: {
            state: 'fail',
            errors: [{ message: failureMessage }],
          },
        });
        const test = createVitestTest({
          suite,
          result: { state: 'skip' },
        });
        const result = convertTestToTestResult(test);
        expect(result.status).to.be.equal(TestStatus.Failed);
        expect((result as FailedTestResult).failureMessage).to.be.equal(
          failureMessage,
        );
      });

      it('should have status failed in a deeply nested failed suite', () => {
        const failureMessage =
          "Cannot read properties of undefined (reading 'get')";
        const rootSuite = createSuite({
          result: {
            state: 'fail',
            errors: [{ message: failureMessage }],
          },
        });
        const nestedSuite = createSuite({
          suite: rootSuite,
          result: { state: 'skip' },
        });
        const deeplyNestedSuite = createSuite({
          suite: nestedSuite,
          result: { state: 'skip' },
        });
        const test = createVitestTest({
          suite: deeplyNestedSuite,
          result: { state: 'skip' },
        });
        const result = convertTestToTestResult(test);
        expect(result.status).to.be.equal(TestStatus.Failed);
        expect((result as FailedTestResult).failureMessage).to.be.equal(
          failureMessage,
        );
      });

      it('should have default error message if suite failed without error message', () => {
        const suite = createSuite({
          result: {
            state: 'fail',
            errors: undefined,
          },
        });
        const test = createVitestTest({
          suite,
          result: { state: 'skip' },
        });
        const result = convertTestToTestResult(test);
        expect(result.status).to.be.equal(TestStatus.Failed);
        expect((result as FailedTestResult).failureMessage).to.be.equal(
          'StrykerJS: Suite execution failed',
        );
      });
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

    it('should have status Success if task state is pass', () => {
      const test = createVitestTest({ result: { state: 'pass' } });
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Success);
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
      const suite = createSuite({
        tasks: [
          createVitestTest({ name: 'test1', id: '1' }),
          createVitestTest({ name: 'test2', id: '2' }),
        ],
      });
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });

    it('should return 2 tests for a suite with nested suite with 2 tests', () => {
      const suite = createSuite({
        tasks: [
          createSuite({
            id: '2',
            name: 'suite2',
            tasks: [
              createVitestTest({ name: 'test1', id: '1' }),
              createVitestTest({ name: 'test2', id: '2' }),
            ],
          }),
        ],
      });
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });
  });
});
