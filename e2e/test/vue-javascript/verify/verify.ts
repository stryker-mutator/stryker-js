import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as path from 'path';

describe('After running stryker on VueJS project', () => {
  it('should report 25% mutation score', async () => {
    const eventsDir = path.resolve(__dirname, '..', 'reports', 'mutation', 'events');
    const allReportFiles = await fsAsPromised.readdir(eventsDir);
    const mutationTestReportFile = allReportFiles.find(file => !!file.match(/.*onMutationTestReportReady.*/));
    expect(mutationTestReportFile).ok;
    const mutationTestReportContent = await fsAsPromised.readFile(path.resolve(eventsDir, mutationTestReportFile || ''), 'utf8');
    const mutationTestResult = JSON.parse(mutationTestReportContent) as mutationTestReportSchema.MutationTestResult;

    expect(mutationTestResult.metrics.killed).eq(4);
    expect(mutationTestResult.metrics.survived).eq(12);
    expect(mutationTestResult.metrics.mutationScore).to.equal(25);
  });
});
