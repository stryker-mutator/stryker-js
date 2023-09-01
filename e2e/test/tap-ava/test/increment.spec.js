import test from 'ava';

import { increment } from '../src/increment.js';

test('increment: should be able to add one to a number', (t) => {
    const number = 2;
    const expected = 3;

    const actual = increment(number);

    t.is(actual, expected);
});
