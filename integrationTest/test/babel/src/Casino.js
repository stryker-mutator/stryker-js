var Bank = require('./Bank').default;
// We use a require statement to see if stryker will work if users use require statements

export default class Casino extends Bank {
  constructor(chips, money) {
    super(money);
    this.chips = chips;
  }

  isOldEnough(user) {
    return user.age >= 18;
  }

  buyChips(user, amount) {
    const chipPrice = 5;
    const price = amount * chipPrice;

    if (user.money >= price && amount <= this.chips) {
      user.subtractMoney(price);
      this.addMoney(price);
      user.chips += amount;
      this.chips -= amount;
    }
  }

  sellChips(user, amount) {
    this.buyChips(user, -amount);
  }
}