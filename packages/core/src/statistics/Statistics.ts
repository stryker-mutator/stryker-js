import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

const AZURE_URL = 'https://localstrykertryout.azurewebsites.net/api/HttpTrigger?code=4GWK/KLC6JRlec96851wMgMsD2JkVePiaALWw6lKv4R3RZiKf0xp0w==';

export class Statistics {
  public static inject = tokens(commonTokens.logger, 'httpClient');
  public statistics: any = {};

  constructor(private readonly log: Logger, private readonly httpStatisticsClient: HttpClient) {
    this.statistics.implementation = 'Stryker';
  }

  public sendStatistics(): Promise<void> {
    this.log.info(`Sending anonymous statistics to ${AZURE_URL}`);
    const statisticsData = JSON.stringify(this.statistics);
    return this.httpStatisticsClient
      .post(AZURE_URL, statisticsData, {
        ['Content-Type']: 'application/json'
      })
      .then(body => {
        if (body.message.statusCode != 201) {
          this.log.info(`Sending statistics resulted in http status ${body.message.statusCode}`);
        }
      })
      .catch(err => {
        this.log.error('Unable to reach statistics server');
      });
  }
}
