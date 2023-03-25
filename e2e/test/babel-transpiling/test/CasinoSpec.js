import assert from 'assert';
import Casino from '../src/Casino';
import User from '../src/User';

describe('Casino', () => {
  describe('user over 18', () => {
    it('should be allowed inside', () => {
      const casino = new Casino();
      const user = new User('Bob', 24);

      const result = casino.isOldEnough(user);

      assert.equal(result, true);
    });
  });

  describe('buyChips', () => {
    it('should add chips to the user', () => {
      const casino = new Casino(100, 50000);
      const user = new User('Bob', 24, 200);
      const chipsToBuy = 10;

      casino.buyChips(user, chipsToBuy);

      assert.equal(user.chips, chipsToBuy);
    });
  });
});