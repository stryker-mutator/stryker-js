import { deepFreeze } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { RuntimeAppender } from '../../../src/cjs/logging/runtime-appender.js';
import { StripAnsiAppender, configure } from '../../../src/cjs/logging/strip-ansi-appender.js';

import { createLoggingEvent } from './helpers.js';

describe(StripAnsiAppender.name, () => {
  let sut: RuntimeAppender;
  let findAppenderStub: sinon.SinonStub<[string], RuntimeAppender>;
  let innerAppender: sinon.SinonStubbedMember<RuntimeAppender>;

  beforeEach(() => {
    findAppenderStub = sinon.stub();
    innerAppender = sinon.stub();
    findAppenderStub.returns(innerAppender);
    sut = configure({ appender: 'foo' }, null, findAppenderStub);
  });

  it('should request configured appender when configured', () => {
    sinon.assert.calledOnceWithExactly(findAppenderStub, 'foo');
  });

  it("should pass through events that don't have ANSI escape characters", () => {
    const actualLogEvent = createLoggingEvent({ data: ['Lorem ipsum', 42, undefined, true] });
    deepFreeze(actualLogEvent);
    sut(actualLogEvent);
    sinon.assert.calledOnceWithExactly(innerAppender, actualLogEvent);
    // check to see if it the same instance
    expect(innerAppender.getCall(0).args[0]).eq(actualLogEvent);
  });
  it('should pass through a shallow copy with removed ANSI escape characters', () => {
    const logEvent = createLoggingEvent({ data: ['[93m0[39m files changed ([31m[92m+0[39m[39m [91m-0[39m)', 42, undefined, true] });
    const expectedLogEvent = createLoggingEvent({ data: ['0 files changed (+0 -0)', 42, undefined, true], serialise: logEvent.serialise });
    deepFreeze(logEvent);
    sut(logEvent);
    sinon.assert.calledOnceWithExactly(innerAppender, expectedLogEvent);
    // check to see that it is not the same instance
    expect(innerAppender.getCall(0).args[0]).not.eq(logEvent);
  });
});
