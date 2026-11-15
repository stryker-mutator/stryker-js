import { expect, it, describe } from 'vitest';

describe('calc', () => {
  it('add', () => {
    expect(1 + 1).toBe(2);
  });

  // The name starts with the name of the test above
  it('add negative', () => {
    expect(1 + -1).toBe(100);
  });

  // Vitest trims the name in the test id, but not in the full name that is matched
  it('padded ', () => {
    expect(1 + 1).toBe(2);
  });
});
