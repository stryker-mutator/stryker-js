import assert from 'assert';
import Bank from '../src/Bank';

describe('Bank', () => {
  it('should set money', () => {
    const money = 500;

    const bank = new Bank(money);

    assert.equal(bank.money, money);
  });

  describe('addMoney', () => {
    it('should add money', () => {
      const bank = new Bank(0);
      const money = 100;

      bank.addMoney(money);

      assert.equal(bank.money, money);
    });

    it('should not add money if it\'s a negative amount', () => {
      const bank = new Bank(0);
      const money = -100;

      bank.addMoney(money);

      assert.notEqual(bank.money, money);
      assert.equal(bank.money, 0);
    });
  });

  describe('subtractMoney', () => {
    it('should subtract money', () => {
      const bank = new Bank(500);
      const money = 100;

      bank.subtractMoney(money);

      assert.equal(bank.money, 500 - money);
    });

    it('should not subtract money if it\'s a negative amount', () => {
      const bank = new Bank(500);
      const money = -100;

      bank.addMoney(money);

      assert.notEqual(bank.money, money);
      assert.equal(bank.money, 500);
    });
  });
});