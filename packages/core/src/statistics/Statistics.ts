import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { JsonLoader } from './JsonLoader';
import { StatisticsData } from './StatisticsData';

const AZURE_URL = 'https://strykerstatistics.azurewebsites.net/api/ReceiveStatistics?code=jVZfGmoB6ofRPa/yPdN/mAOCd6ia67XQkTmLaGWCzlxO5a32PlLj6A==';

export class Statistics {
  public static inject = tokens(commonTokens.logger);
  private statistics: StatisticsData = { implementation: 'Stryker' };

  constructor(private readonly log: Logger) {}

  private setGenericData() {
    this.setStatistic('version', JsonLoader.loadFile('../../package.json').version);
  }

  public sendStatistics(): Promise<void> {
    this.setGenericData();
    this.log.info(`Sending anonymous statistics to ${AZURE_URL}`);
    const statisticsData = JSON.stringify(this.statistics);
    this.log.info(statisticsData);
    const httpStatisticsClient = new HttpClient('httpClient');
    return httpStatisticsClient
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

  public setStatistic<K extends keyof StatisticsData>(name: K, value: StatisticsData[K]): StatisticsData {
    this.statistics[name] = value;
    return this.statistics;
  }

  public getStatistic<K extends keyof StatisticsData>(name: K): StatisticsData[K] {
    return this.statistics[name];
  }
}
