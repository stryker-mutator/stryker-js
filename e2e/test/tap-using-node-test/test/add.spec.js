import test from 'node:test';
import { equal } from 'node:assert/strict';
import { add } from '../src/add.js';

test('add', (t) => {
  t.test('should be able to add two numbers', (t) => {
    const actual = add(5, 2);
    equal(actual, 7);
  });
});
