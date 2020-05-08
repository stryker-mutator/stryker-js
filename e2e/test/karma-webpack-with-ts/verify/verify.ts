import { readMutationTestResult } from '../../../helpers';
import { expect } from 'chai';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    // TODO: After these results should be much better after we've implemented mutation switching
    const result = await readMutationTestResult();
    expect(result.metrics.mutationScore, 'mutationScore').greaterThan(10);
    expect(result.metrics.timeout, 'timeout').gte(1);
    expect(result.metrics.killed, 'killed').gte(5);
  });
});
