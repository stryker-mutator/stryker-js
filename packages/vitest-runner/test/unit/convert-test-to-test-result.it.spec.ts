import { Test } from 'vitest';

import { expect } from 'chai';

import { TestStatus } from '@stryker-mutator/api/test-runner';

import { convertTestToTestResult, fromTestId, toTestId } from '../../src/utils/convert-test-to-test-result.js';

describe('convert test to test result', () => {
  it('toTestId should return correct testId', () => {
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
    expect(result).to.be.equal('file.js#test1');
  });

  it('fromTestId should return correct fileName', () => {
    const result = fromTestId('file.js#test1');
    expect(result.file).to.be.equal('file.js');
    expect(result.name).to.be.equal('test1');
  });

  it('convertTestToTestResult should have status skipped if taskstate is skipped', () => {
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

  it('convertTestToTestResult should have status skipped if taskstate is todo', () => {
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

  it('convertTestToTestResult should have status Failed if result is undefined', () => {
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
