import { Reporter, ScoreResult } from 'stryker-api/report';
import DashboardReporterClient from './DashboardReporterClient';
import { getEnvironmentVariable } from '../../utils/objectUtils';
import { Logger } from 'stryker-api/logging';
import { determineCIProvider } from '../ci/Provider';
import { commonTokens, tokens } from 'stryker-api/plugin';
import { dashboardReporterTokens } from './tokens';

export default class DashboardReporter implements Reporter {

  private readonly ciProvider = determineCIProvider();
  public static readonly inject = tokens(commonTokens.logger, dashboardReporterTokens.dashboardReporterClient);

  constructor(
    private readonly log: Logger,
    private readonly dashboardReporterClient: DashboardReporterClient
  ) { }

  private readEnvironmentVariable(name: string) {
    const environmentVariable = getEnvironmentVariable(name);
    if (environmentVariable) {
      return environmentVariable;
    } else {
      this.log.warn(`Missing environment variable ${name}`);
      return undefined;
    }
  }

  public async onScoreCalculated(ScoreResult: ScoreResult) {
    const mutationScore = ScoreResult.mutationScore;

    if (this.ciProvider !== undefined) {
      const isPullRequest = this.ciProvider.isPullRequest();

      if (!isPullRequest) {
        const repository = this.ciProvider.determineRepository();
        const branch = this.ciProvider.determineBranch();
        const apiKey = this.readEnvironmentVariable('STRYKER_DASHBOARD_API_KEY');

        if (repository && branch && apiKey) {
          await this.dashboardReporterClient.postStrykerDashboardReport({
            apiKey,
            branch,
            mutationScore,
            repositorySlug: 'github.com/' + repository
          });
        }
      } else {
        this.log.info('Dashboard report is not sent when building a pull request');
      }
    } else {
      this.log.info('Dashboard report is not sent when not running on a build server');
    }
  }
}
