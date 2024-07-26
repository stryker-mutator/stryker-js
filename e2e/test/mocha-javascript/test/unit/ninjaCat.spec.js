import ninjaCatSays from '../../src/🐱‍👓ninja.cat.js';
import { expect } from 'chai';

describe('🐱‍👓', () => {
  describe('ninjaCatSays', () => {
    it('should speak', () => {
      expect(ninjaCatSays('ATTACK!')).eq('🐱‍👓 ATTACK!')
    });
  });
});
