import { Suite } from 'vitest';

import { expect } from 'chai';

import { collectTestsFromSuite } from '../../src/utils/collect-tests-from-suite.js';

describe('collect tests from suite', () => {
  it('empty suite should return empty array', () => {
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
  it('suite with 1 test should return 1 test', () => {
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

  it('suite with 2 tests should return 2 tests', () => {
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

  it('suite with nested suite with 2 tests should return 2 tests', () => {
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
