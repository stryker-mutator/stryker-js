import test from 'ava';
import { add } from '../src/add.js';

test('add: should be able to add two numbers', (t) => {
  const actual = add(5, 2);
  t.is(actual, 7);
});
