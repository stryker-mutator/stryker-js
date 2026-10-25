import { expect, it } from 'vitest';

it('should pass without reaching instrumented code', () => {
  expect(1 + 1).toBe(2);
});
