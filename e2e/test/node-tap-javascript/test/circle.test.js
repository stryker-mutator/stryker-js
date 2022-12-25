import tap from 'tap';
import { getCircumference } from '../src/circle.js';

tap.test('circle', (t) => {
  t.equal(getCircumference(1), 2 * Math.PI);
  t.end();
});
