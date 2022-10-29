export class IdGenerator {
  private childId: number;
  constructor() {
    this.childId = 0;
  }
  public next(): number {
    return this.childId++;
  }
}
