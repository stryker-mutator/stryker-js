import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { JsonLoader } from './JsonLoader';

const AZURE_URL = 'https://strykerstatistics.azurewebsites.net/api/ReceiveStatistics?code=jVZfGmoB6ofRPa/yPdN/mAOCd6ia67XQkTmLaGWCzlxO5a32PlLj6A==';

export class Statistics {
  public static inject = tokens(commonTokens.logger, 'httpClient', 'testRunner');
  public statistics: Record<string, any> = {};

  constructor(private readonly log: Logger, private readonly httpStatisticsClient: HttpClient, private readonly testRunner: string) {
    this.statistics.implementation = 'Stryker';
    this.statistics.testRunner = this.testRunner;
  }

  public addStatistic(name: string, value: any) {
    this.statistics[name] = value;
  }

  private setGenericData() {
    this.statistics.version = JsonLoader.loadFile('../../package.json').version;
  }

  public sendStatistics(): Promise<void> {
    this.setGenericData();
    this.log.info(`Sending anonymous statistics to ${AZURE_URL}`);
    const statisticsData = JSON.stringify(this.statistics);
    this.log.info(statisticsData);
    return this.httpStatisticsClient
      .post(AZURE_URL, statisticsData, {
        ['Content-Type']: 'application/json'
      })
      .then(body => {
        if (body.message.statusCode != 201) {
          this.log.warn(`Sending statistics resulted in http status ${body.message.statusCode}`);
        }
      })
      .catch(err => {
        this.log.error('Unable to reach statistics server');
      });
  }
}
