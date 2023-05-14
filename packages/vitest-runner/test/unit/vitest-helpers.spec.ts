import { Suite, Test } from 'vitest';

import { expect } from 'chai';

import { TestStatus } from '@stryker-mutator/api/test-runner';

import { collectTestsFromSuite, convertTestToTestResult, fromTestId, toTestId } from '../../src/vitest-helpers.js';

describe('vitest-helpers', () => {
  describe(toTestId.name, () => {
    it('should return correct testId', () => {
      const test: Test = {
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          mode: 'run',
        },
        id: '1',
        name: 'test1',
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          filepath: 'file.js',
          type: 'suite',
          id: '1',
          mode: 'run',
          tasks: [],
        },
      };
      const result = toTestId(test);
      expect(result).to.be.equal('file.js#suite test1');
    });
  });

  describe(fromTestId.name, () => {
    it('should return correct fileName', () => {
      const result = fromTestId('file.js#test1');
      expect(result.file).to.be.equal('file.js');
      expect(result.name).to.be.equal('test1');
    });
  });

  describe(convertTestToTestResult.name, () => {
    it('should have status skipped if taskstate is skipped', () => {
      const test: Test = {
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          mode: 'run',
        },
        id: '1',
        name: 'test1',
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          filepath: 'file.js',
          type: 'suite',
          id: '1',
          mode: 'run',
          tasks: [],
        },
        result: {
          state: 'skip',
        },
      };
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Skipped);
    });

    it('should have status skipped if taskstate is todo', () => {
      const test: Test = {
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          mode: 'run',
        },
        id: '1',
        name: 'test1',
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          filepath: 'file.js',
          type: 'suite',
          id: '1',
          mode: 'run',
          tasks: [],
        },
        result: {
          state: 'todo',
        },
      };
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Skipped);
    });

    it('should have status Failed if result is undefined', () => {
      const test: Test = {
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          mode: 'run',
        },
        id: '1',
        name: 'test1',
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          filepath: 'file.js',
          type: 'suite',
          id: '1',
          mode: 'run',
          tasks: [],
        },
      };
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Failed);
    });
  });

  describe(collectTestsFromSuite.name, () => {
    it('should return empty array for an empty suite', () => {
      const suite: Suite = {
        type: 'suite',
        tasks: [],
        id: '1',
        name: 'suite',
        mode: 'run',
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.be.empty;
    });
    it('should return 1 test for a suite with 1 test', () => {
      const suite: Suite = {
        type: 'suite',
        id: '1',
        name: 'suite',
        mode: 'run',
        tasks: [
          {
            type: 'test',
            id: '1',
            name: 'test1',
            mode: 'run',
            context: {} as any,
            suite: {} as any,
          },
        ],
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(1);
    });

    it('should return 2 tests for a suite with 2 tests', () => {
      const suite: Suite = {
        type: 'suite',
        id: '1',
        name: 'suite',
        mode: 'run',
        tasks: [
          {
            type: 'test',
            id: '1',
            name: 'test1',
            mode: 'run',
            context: {} as any,
            suite: {} as any,
          },
          {
            type: 'test',
            id: '2',
            name: 'test2',
            mode: 'run',
            context: {} as any,
            suite: {} as any,
          },
        ],
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });

    it('should return 2 tests for a suite with nested suite with 2 tests', () => {
      const suite: Suite = {
        type: 'suite',
        id: '1',
        name: 'suite1',
        mode: 'run',
        tasks: [
          {
            type: 'suite',
            id: '2',
            name: 'suite2',
            mode: 'run',
            tasks: [
              {
                type: 'test',
                id: '1',
                name: 'test1',
                mode: 'run',
                context: {} as any,
                suite: {} as any,
              },
              {
                type: 'test',
                id: '2',
                name: 'test2',
                mode: 'run',
                context: {} as any,
                suite: {} as any,
              },
            ],
          },
        ],
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });
  });
});
