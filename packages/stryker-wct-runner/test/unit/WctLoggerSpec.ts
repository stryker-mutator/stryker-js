import { expect } from 'chai';
import { EventEmitter } from 'events';
import WctLogger from '../../src/WctLogger';
import logger from '../helpers/loggingMock';

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
    sut = new WctLogger(context, false);
    emitAllLogEvents();
    expect(logger.debug).calledWith('Keeping wct quiet. To enable wct logging, set `wct.verbose` to `true` in your Stryker configuration file.');
    expect(logger.info).not.called;
    expect(logger.warn).not.called;
    expect(logger.error).not.called;
  });

  it('should forward all logging when verbose = true', () => {
    sut = new WctLogger(context, true);
    emitAllLogEvents();
    expect(logger.debug).calledWith('debug');
    expect(logger.info).calledWith('info');
    expect(logger.warn).calledWith('warn');
    expect(logger.error).calledWith('error');
  });

  function emitAllLogEvents() {
    ['debug', 'info', 'warn', 'error'].forEach(logEvent => {
      context.emit(`log:${logEvent}`, logEvent);
    });
  }
});
