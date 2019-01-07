import StrykerError from '../../src/StrykerError';
import { expect } from 'chai';
import { errorToString } from '../../src/errors';

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
});
