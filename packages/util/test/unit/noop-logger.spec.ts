import { expect } from 'chai';
import sinon from 'sinon';

import { noopLogger } from '../../src/noop-logger.js';

describe('noopLogger', () => {
  it('should not enable any logging', () => {
    expect(noopLogger.isTraceEnabled()).false;
    expect(noopLogger.isDebugEnabled()).false;
    expect(noopLogger.isInfoEnabled()).false;
    expect(noopLogger.isWarnEnabled()).false;
    expect(noopLogger.isErrorEnabled()).false;
    expect(noopLogger.isFatalEnabled()).false;
  });

  it('should not do any actual logging', () => {
    const logStub = sinon.stub(console, 'log');
    noopLogger.trace();
    noopLogger.debug();
    noopLogger.info();
    noopLogger.warn();
    noopLogger.error();
    noopLogger.fatal();
    expect(logStub).not.called;
  });
});
