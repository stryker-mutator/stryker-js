import childProcess = require('child_process');
import { expect } from 'chai';
import { childProcessAsPromised } from '../../src';
import { promisify } from 'util';

describe('childProcessAsPromised', () => {
  it(`should expose promisified exec`, () => {
    // It's difficult to test this any other way. At least this way, we know it is promisified.
    expect(childProcessAsPromised.exec.toString()).eq(promisify(childProcess.exec).toString());
  });
});
