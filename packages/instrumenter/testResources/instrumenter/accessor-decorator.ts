import { observable } from 'mobx';

class Counter {
  @observable accessor count = 0;

  increment(): number {
    return this.count + 1;
  }
}
