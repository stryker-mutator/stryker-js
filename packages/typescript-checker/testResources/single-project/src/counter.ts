export class Counter {
  constructor(private currentNumber: number) {}
  public increment(numberToIncrementBy = 1): number {
    return (this.currentNumber += numberToIncrementBy);
  }
  get getCurrentNumber(): number {
    return this.currentNumber;
  }
}
