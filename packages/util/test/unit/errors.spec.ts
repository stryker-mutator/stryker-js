import { expect } from 'chai';

import { errorToString } from '../../src/errors';

describe('errors', () => {
  describe('errorToString', () => {
    it('should return empty string if error is undefined', () => {
      expect(errorToString(undefined)).eq('');
    });

    it('should convert a nodejs Errno error to string', () => {
      const error: NodeJS.ErrnoException = {
        code: 'foo',
        errno: 20,
        message: 'message',
        name: 'name',
        path: 'bar',
        stack: 'qux',
        syscall: 'baz',
      };
      expect(errorToString(error)).eq('name: foo (baz) qux');
    });

    it('should convert a regular error to string', () => {
      const error = new Error('expected error');
      expect(errorToString(error)).eq(`Error: expected error\n${error.stack && error.stack.toString()}`);
    });

    it('should convert an error without a stack trace to string', () => {
      const error = new Error('expected error');
      delete error.stack;
      expect(errorToString(error)).eq('Error: expected error');
    });
  });
});
