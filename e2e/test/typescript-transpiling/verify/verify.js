import path from 'path';
import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should report correct score - native preview', async () => {
    await expectMetricsJsonToMatchSnapshot(
      path.resolve('reports', 'mutation', 'mutation-native-preview.json'),
    );
  });
});
