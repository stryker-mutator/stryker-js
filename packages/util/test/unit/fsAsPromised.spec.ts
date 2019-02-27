import fs = require('fs');
import { expect } from 'chai';
import { fsAsPromised, promisify } from '../../src';

describe('fsAsPromised', () => {

  describePromisifiedFunction('exists');
  describePromisifiedFunction('lstat');
  describePromisifiedFunction('symlink');
  describePromisifiedFunction('readFile');
  describePromisifiedFunction('writeFile');
  describePromisifiedFunction('stat');
  describePromisifiedFunction('readdir');

  describeProxyFunction('existsSync');
  describeProxyFunction('readdirSync');
  describeProxyFunction('createReadStream');
  describeProxyFunction('createWriteStream');

  function describeProxyFunction(fnToTest: keyof typeof fs & keyof typeof fsAsPromised) {
    it(`should proxy ${fnToTest}`, () => {
      // It's difficult to test this any other way. At least this way, we know it is promisified.
      expect(fsAsPromised[fnToTest]).eq(fs[fnToTest]);
    });
  }

  function describePromisifiedFunction(fnToTest: keyof typeof fs & keyof typeof fsAsPromised) {
    it(`should expose promisified ${fnToTest}`, () => {
      // It's difficult to test this any other way. At least this way, we know it is promisified.
      expect(fsAsPromised[fnToTest].toString()).eq(promisify(fs[fnToTest]).toString());
    });
  }
});
