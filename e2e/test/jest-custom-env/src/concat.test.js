/**
 * @jest-environment ./custom-env
 */
import { concat } from './concat';

test('concat', () => {
  expect(concat('a', 'b')).toBe('a b');
});
