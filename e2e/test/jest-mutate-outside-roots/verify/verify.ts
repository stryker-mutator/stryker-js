import { expectMetrics } from "../../../helpers";

describe('jest sut outside roots e2e', () => {

  it('should result in the expected mutation score', async () => {
    await expectMetrics({
      survived: 1,
      killed: 3,
      timeout: 0,
      noCoverage: 0
    });
  });
});
