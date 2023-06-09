import test from 'ava';
import { add } from '../src/math.js';

test('Adding two numbers', t => {
  t.is(add(5, 10), 15);
  t.is(add(100, 200), 300);
});

test('Slow adding two numbers', t => {
  t.is(add(5, 10), 15);
  t.is(add(100, 200), 300);
});
