//import { StrykerOptions } from '@stryker-mutator/api/core';
//import LogConfigurator from '../logging/LogConfigurator';
// import { errorToString } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

const AZURE_URL = 'https://localstrykertryout.azurewebsites.net/api/HttpTrigger?code=4GWK/KLC6JRlec96851wMgMsD2JkVePiaALWw6lKv4R3RZiKf0xp0w==';

export class Statistics {
  public static inject = tokens(commonTokens.logger, 'httpClient');
  public statistics: any = {};

  constructor(private readonly log: Logger, private readonly http: HttpClient) {
    this.statistics.implementation = 'Stryker';
  }

  public getStatistics() {
    return this.statistics.implementation;
  }

  public sendStatistics(): Promise<void> {
    this.log.info(`Sending anonymous statistics to ${AZURE_URL}`);
    return this.http
      .post(AZURE_URL, JSON.stringify(this.statistics), {
        ['Content-Type']: 'application/json'
      })
      .then(body => {
        this.log.info(`Received status code: ${body.message.statusCode}`);
      })
      .catch(err => {
        this.log.error(`Error sending statistics: ${err}`);
      });
  }
}
