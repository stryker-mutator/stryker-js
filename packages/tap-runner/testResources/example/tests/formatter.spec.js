import tap from 'tap';
import { concat } from '../src/formatter.js';

tap.test('Concat two strings', ({ equal, end }) => {
  equal(concat('3', 'hours'), '3hours', 'Adding 10 and 5 equal to 15')
  end();
});
