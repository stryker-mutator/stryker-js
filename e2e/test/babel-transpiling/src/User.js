import Bank from './Bank';

export default class User extends Bank {
  constructor(name, age, money) {
    super(money);
    this.name = name;
    this.age = age;
    this.chips = 0;
  }
}