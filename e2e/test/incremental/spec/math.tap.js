import { test } from 'tap';
import { add, multiply } from '../src/math.js';

test('add should add two numbers', (t) => {
  t.test('should add two numbers', (t) => {
    t.equal(add(1, 0), 1);
    t.end();
  });
  t.end();
});

test('multiply', (t) => {
  t.test('should multiply the numbers', (t) => {
    // Bad test, surviving mutant when * => /
    t.equal(multiply(2, 0), 0);
    t.end();
  });
  t.end();
});
