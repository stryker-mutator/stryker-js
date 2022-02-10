import { expectMetricsJsonToMatchSnapshot } from "../../../helpers";
describe('jest sut outside roots e2e', () => {
    it('should result in the expected mutation score', async () => {
        await expectMetricsJsonToMatchSnapshot();
    });
});




