import promisify, { innerPromisify } from '../../src/promisify';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { exec } from 'child_process';
import { exists } from 'fs';

describe('promisify', () => {
  describePromisify(promisify);
});

describe('innerPromisify', () => {
  describePromisify(innerPromisify);
});

function describePromisify(promisifyImplementation: any) {

  it('should resolve the promise when the callback resolves', async () => {
    // Arrange
    const actualCallbackFn = sinon.stub();

    // Act
    const actualPromisifiedFn = promisifyImplementation(actualCallbackFn);
    const actualPromise = actualPromisifiedFn('foo', 42);
    actualCallbackFn.callArgWith(2, null, 'baz', 42);
    const actualResult = await actualPromise;

    // Assert
    expect(actualPromise).instanceOf(Promise);
    expect(actualCallbackFn).calledWithExactly('foo', 42, sinon.match.func);
    expect(actualResult).eq('baz');
  });

  it('should reject the promise when the callback resolved with an error', async () => {
    // Arrange
    const actualCallbackFn = sinon.stub();
    const expectedError = new Error('foobar');

    // Act
    const actualPromisifiedFn = promisifyImplementation(actualCallbackFn);
    const actualPromise = actualPromisifiedFn('foo', 42);
    actualCallbackFn.callArgWith(2, expectedError);

    // Assert
    expect(actualPromise).instanceOf(Promise);
    expect(actualCallbackFn).calledWithExactly('foo', 42, sinon.match.func);
    await expect(actualPromise).rejectedWith(expectedError);
  });

  it('should resolve child_process.exec as an object instead of an array', async () => {
    const execAsPromised = promisifyImplementation(exec);
    const result = await execAsPromised('node -p \'"foo"\'');
    expect(result.stdout.trim()).eq('foo');
  });

  it('should resolve fs.exists with first argument being result instead of an error', async () => {
    const existsAsPromised = promisifyImplementation(exists);
    const result = await existsAsPromised(__filename);
    expect(result).eq(true);
  });
}
