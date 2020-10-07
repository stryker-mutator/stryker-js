import { expect } from 'chai';

import { errorToString } from '../../src/errors';
import StrykerError from '../../src/StrykerError';

describe('StrykerError', () => {
  it('should set inner error', () => {
    const innerError = new Error();
    const sut = new StrykerError('some message', innerError);
    expect(sut.innerError).eq(innerError);
  });

  it('should add inner error to the message', () => {
    const innerError = new Error();
    const sut = new StrykerError('some message', innerError);
    expect(sut.message).eq(`some message. Inner error: ${errorToString(innerError)}`);
  });

  it('should work without an inner error', () => {
    const sut = new StrykerError('foo bar');
    expect(sut.message).eq('foo bar');
  });
});
