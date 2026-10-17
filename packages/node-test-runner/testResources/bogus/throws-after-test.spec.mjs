import test from 'node:test';

test('registered before the error', () => {});
throw new Error('thrown after the first test');
