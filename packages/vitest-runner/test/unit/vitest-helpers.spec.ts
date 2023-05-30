import path from 'path';

import { Suite, Test } from 'vitest';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';

import { normalizeFileName } from '@stryker-mutator/util';

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
          meta: {},
          mode: 'run',
        },
        id: '1',
        name: 'test1',
        meta: {},
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          // Using normalizeFileName here mimics the behavior of vitest on windows: using forward slashes
          filepath: normalizeFileName(path.resolve('src', 'file.js')),
          type: 'suite',
          id: '1',
          mode: 'run',
          tasks: [],
          meta: {},
        },
      };
      const result = toTestId(test);
      expect(result).to.be.equal('src/file.js#suite test1');
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
          meta: {},
        },
        id: '1',
        meta: {},
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
          meta: {},
        },
        result: {
          state: 'skip',
        },
      };
      const result = convertTestToTestResult(test);
      expect(result.status).to.be.equal(TestStatus.Skipped);
    });

    it('should have status skipped if task state is todo', () => {
      const test: Test = {
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          mode: 'run',
          meta: {},
        },
        meta: {},
        id: '1',
        name: 'test1',
        mode: 'run',
        context: {} as any,
        file: {
          name: 'file.js',
          meta: {},
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
        meta: {},
        type: 'test',
        suite: {
          type: 'suite',
          tasks: [],
          id: '1',
          name: 'suite',
          meta: {},
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
          meta: {},
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
        meta: {},
        mode: 'run',
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.be.empty;
    });
    it('should return 1 test for a suite with 1 test', () => {
      const suite: Suite = {
        type: 'suite',
        meta: {},
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
            meta: {},
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
        meta: {},
        tasks: [
          {
            type: 'test',
            id: '1',
            name: 'test1',
            mode: 'run',
            context: {} as any,
            suite: {} as any,
            meta: {},
          },
          {
            type: 'test',
            id: '2',
            name: 'test2',
            mode: 'run',
            context: {} as any,
            suite: {} as any,
            meta: {},
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
        meta: {},
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
                meta: {},
              },
              {
                type: 'test',
                id: '2',
                name: 'test2',
                mode: 'run',
                context: {} as any,
                suite: {} as any,
                meta: {},
              },
            ],
            meta: {},
          },
        ],
      };
      const result = collectTestsFromSuite(suite);
      expect(result).to.have.lengthOf(2);
    });
  });
});
