const ninjaCatSays = require('../../src/🐱‍👓ninja.cat');
const { expect } = require('chai');

describe('🐱‍👓', () => {
  describe('ninjaCatSays', () => {
    it('should speak', () => {
      expect(ninjaCatSays('ATTACK!')).eq('🐱‍👓 ATTACK!')
    });
  });
});
