import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';
describe('After running stryker on VueJS project', () => {
    it('should report ~29% mutation score', async () => {
        await expectMetricsJsonToMatchSnapshot();
    });
});




