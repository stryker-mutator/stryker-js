export default class Bank {
  constructor(money) {
    this.money = money;
  }

  addMoney(amount) {
    if (amount > 0) {
      this.money += amount;
    }
  }

  subtractMoney(amount) {
    if (amount > 0) {
      this.money -= amount;
    }

    if (this.money < 0) {
      this.money = 0;
    }
  }
}