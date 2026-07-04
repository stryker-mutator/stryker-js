import { test } from 'node:test';
import assert from 'node:assert';

test('passes', () => assert.ok(true));
test('skipped', { skip: true }, () => assert.fail('never runs'));
// a failing todo is non-fatal to `node --test` and must not fail a Stryker run
test('todo that fails', { todo: true }, () => assert.equal(1, 2));
