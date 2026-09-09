import { describe, it, expect } from 'vitest';
import { add } from './add.js';

describe('math (numbers)', () => {
  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
  });
});
