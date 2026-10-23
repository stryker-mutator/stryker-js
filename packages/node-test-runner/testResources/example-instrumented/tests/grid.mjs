import test from 'node:test';
import assert from 'node:assert/strict';
import { concat } from '../src/formatter.mjs';

// Declares a test from a shared helper, so node:test reports this file as its location.
export function grid(name) {
  test(`grid: ${name}`, () => {
    assert.equal(concat(name, '!'), `${name}!`);
  });
}
