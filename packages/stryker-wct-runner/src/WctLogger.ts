import { LoggerFactory } from 'stryker-api/logging';
import { Context } from 'web-component-tester/runner/context';

export default class WctLogger {

  private readonly log = LoggerFactory.getLogger('web-component-tester');

  constructor(context: Context) {
    if (context.options.verbose) {
      context.on('log:debug', this.log.debug.bind(this.log));
      context.on('log:info', this.log.info.bind(this.log));
      context.on('log:warn', this.log.warn.bind(this.log));
      context.on('log:error', this.log.error.bind(this.log));
    } else {
      this.log.debug('Keeping wct quiet. To enable wct logging, set `wct.verbose` to `true` in your stryker configuration file.');
    }
  }
}
