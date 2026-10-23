import { expect } from 'chai';

import { errorToString } from '../../src/errors.js';

describe('errors', () => {
  describe('errorToString', () => {
    it('should return empty string if error is undefined', () => {
      expect(errorToString(undefined)).eq('');
    });

    it('should convert a nodejs Errno error to string', () => {
      const error: NodeJS.ErrnoException = new Error('message');
      error.code = 'foo';
      error.errno = 20;
      error.name = 'name';
      error.path = 'bar';
      error.stack = 'qux';
      error.syscall = 'baz';
      expect(errorToString(error)).eq('name: foo (baz) qux');
    });

    it('should convert a regular error to string', () => {
      const error = new Error('expected error');
      expect(errorToString(error)).eq(
        `Error: expected error\n${error.stack?.toString()}`,
      );
    });

    it('should convert an error without a stack trace to string', () => {
      const error = new Error('expected error');
      delete error.stack;
      expect(errorToString(error)).eq('Error: expected error');
    });

    it('should convert an error that lost its prototype to string', () => {
      // A structured-clone-style serializer rebuilds an error crossing a worker boundary with
      // `Object.create(null)`, so it is no longer `instanceof Error` and `String()` throws on it.
      const error = Object.create(null) as Record<string, unknown>;
      error.name = 'TypeError';
      error.message = 'expected error';
      error.stack = 'TypeError: expected error\n    at foo.js:1:1';
      expect(errorToString(error)).eq(
        'TypeError: expected error\nTypeError: expected error\n    at foo.js:1:1',
      );
    });

    it('should convert a value without a message that cannot be coerced to a primitive', () => {
      expect(errorToString(Object.create(null))).eq('[object Object]');
    });

    it('should not throw when `Symbol.toPrimitive` throws', () => {
      const error = {
        [Symbol.toPrimitive]() {
          throw new Error('not convertible');
        },
      };
      expect(errorToString(error)).eq('[object Object]');
    });
  });
});
