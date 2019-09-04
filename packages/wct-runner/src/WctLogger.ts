import { Logger } from '@stryker-mutator/api/logging';
import { EventEmitter } from 'events';

export default class WctLogger {

  private readonly logProxy = {
    ['log:debug']: this.log.debug.bind(this.log),
    ['log:error']: this.log.error.bind(this.log),
    ['log:info']: this.log.info.bind(this.log),
    ['log:warn']: this.log.warn.bind(this.log)
  };

  constructor(private readonly context: EventEmitter, verbose: boolean, private readonly log: Logger) {
    if (verbose) {
      Object.keys(this.logProxy).forEach(logEvent => context.on(logEvent, (this.logProxy as any)[logEvent]));
    } else {
      this.log.debug('Keeping wct quiet. To enable wct logging, set `wct.verbose` to `true` in your Stryker configuration file.');
    }
  }

  public dispose() {
    Object.keys(this.logProxy).forEach(logEvent => this.context.removeListener(logEvent, (this.logProxy as any)[logEvent]));
  }
}
