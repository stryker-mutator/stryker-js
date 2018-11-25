import { EventEmitter } from 'events';
import { LoggerFactory } from 'stryker-api/logging';

export default class WctLogger {

  private readonly log = LoggerFactory.getLogger('web-component-tester');

  constructor(emitter: EventEmitter) {
    emitter.on('log:debug', this.log.debug.bind(this.log));
    emitter.on('log:info', this.log.info.bind(this.log));
    emitter.on('log:warn', this.log.warn.bind(this.log));
    emitter.on('log:error', this.log.error.bind(this.log));
  }
}
