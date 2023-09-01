import test from 'ava';

import { negate } from '../src/negate.js';

test('negate: should be able to negate a number', (t) => {
    const actual = negate(2);
    t.is(actual, -2);
});
