import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import WctLogger from '../../src/WctLogger';

describe(WctLogger.name, () => {
  let context: EventEmitter;
  let sut: WctLogger;

  beforeEach(() => {
    context = new EventEmitter();
  });

  afterEach(() => {
    sut.dispose();
    expect(context.listenerCount('log:debug')).eq(0);
    expect(context.listenerCount('log:error')).eq(0);
    expect(context.listenerCount('log:info')).eq(0);
    expect(context.listenerCount('log:warn')).eq(0);
  });

  it('should not forward logging when verbose = false', () => {
    sut = new WctLogger(context, false, testInjector.logger);
    emitAllLogEvents();
    expect(testInjector.logger.debug).calledWith('Keeping wct quiet. To enable wct logging, set `wct.verbose` to `true` in your Stryker configuration file.');
    expect(testInjector.logger.info).not.called;
    expect(testInjector.logger.warn).not.called;
    expect(testInjector.logger.error).not.called;
  });

  it('should forward all logging when verbose = true', () => {
    sut = new WctLogger(context, true, testInjector.logger);
    emitAllLogEvents();
    expect(testInjector.logger.debug).calledWith('debug');
    expect(testInjector.logger.info).calledWith('info');
    expect(testInjector.logger.warn).calledWith('warn');
    expect(testInjector.logger.error).calledWith('error');
  });

  function emitAllLogEvents() {
    ['debug', 'info', 'warn', 'error'].forEach(logEvent => {
      context.emit(`log:${logEvent}`, logEvent);
    });
  }
});
